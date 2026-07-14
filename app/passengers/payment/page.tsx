"use client"

import { Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { useEffect, useState, useCallback } from "react"
import {
  ArrowLeft, ArrowRight, ArrowUpRight, Bus, Clock, Ticket,
  Loader2, MapPin, Route, Ruler, IndianRupee, Shield,
  AlertCircle, CheckCircle2, Calendar, CreditCard, Lock,
  CircleDot, Sparkles
} from "lucide-react"
import { calculateRouteDistance } from "@/lib/distance"
import { calculateFare } from "@/lib/fare"

interface BusData {
  id: number
  busName: string
  fromCity: string
  toCity: string
  price: number
  stops: string[]
}

function PaymentPageContent() {
  const params = useSearchParams()
  const router = useRouter()

  const from = params.get("from") || ""
  const to = params.get("to") || ""
  const busName = params.get("bus") || ""
  const departure = params.get("departure") || ""
  const arrival = params.get("arrival") || ""
  const duration = params.get("duration") || ""

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [stopsCount, setStopsCount] = useState(0)
  const [fare, setFare] = useState(0)
  const [distance, setDistance] = useState(0)
  const [bookingId, setBookingId] = useState<number | null>(null)
  const [pnr, setPnr] = useState("")
  const [paying, setPaying] = useState(false)
  const [paid, setPaid] = useState(false)
  const [step, setStep] = useState<"details" | "processing" | "success" | "failed">("details")
  const [paymentMethod, setPaymentMethod] = useState<"razorpay" | "upi" | "card">("razorpay")
  const [selectedBus, setSelectedBus] = useState<BusData | null>(null)

  const today = new Date().toLocaleDateString("en-IN", {
    day: "numeric", month: "short", year: "numeric",
  })

  const now = new Date().toLocaleTimeString("en-IN", {
    hour: "2-digit", minute: "2-digit",
  })

  const loadRazorpayScript = useCallback(() => {
    return new Promise<void>((resolve) => {
      if ((window as any).Razorpay) {
        resolve()
        return
      }
      const script = document.createElement("script")
      script.src = "https://checkout.razorpay.com/v1/checkout.js"
      script.onload = () => resolve()
      script.onerror = () => resolve()
      document.body.appendChild(script)
    })
  }, [])

  useEffect(() => {
    async function loadRouteData() {
      if (!from || !to) {
        setError("Missing route information")
        setLoading(false)
        return
      }

      try {
        const token = localStorage.getItem("token")
        if (!token) {
          router.push("/login")
          return
        }

        const res = await fetch(
          `/api/buses/search?fromCity=${encodeURIComponent(from)}&toCity=${encodeURIComponent(to)}`,
          { headers: { Authorization: `Bearer ${token}` } }
        )

        if (!res.ok) throw new Error("Failed to fetch route data")

        const data = await res.json()
        const busList: BusData[] = data.validBuses ?? data.buses ?? []

        if (busList.length === 0) {
          setError("No buses available on this route")
          setLoading(false)
          return
        }

        const selectedBus = busList.find((b: BusData) => b.busName === busName) ?? busList[0]
        setSelectedBus(selectedBus)

        const stops = [selectedBus.fromCity, ...(selectedBus.stops || []), selectedBus.toCity]
        const fromIdx = stops.findIndex((s: string) => s.toLowerCase() === from.toLowerCase())
        const toIdx = stops.findIndex((s: string) => s.toLowerCase() === to.toLowerCase())
        let betweenStops: string[] = []
        if (fromIdx !== -1 && toIdx !== -1 && fromIdx < toIdx) {
          betweenStops = stops.slice(fromIdx + 1, toIdx)
        } else if (stops.length > 0) {
          betweenStops = stops
        }
        setStopsCount(betweenStops.length)

        const routeStops = fromIdx !== -1 && toIdx !== -1 && fromIdx < toIdx
          ? stops.slice(fromIdx, toIdx + 1)
          : stops
        const routeDistance = calculateRouteDistance(routeStops)
        setDistance(routeDistance || Math.max(Math.round(betweenStops.length * 1.5), 2))

        setFare(calculateFare(routeDistance || Math.max(Math.round(betweenStops.length * 1.5), 2)))
      } catch (err) {
        setError("Something went wrong. Please try again.")
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    loadRouteData()
  }, [from, to, router])

  const handlePayNow = async () => {
    const token = localStorage.getItem("token")
    if (!token) {
      router.push("/login")
      return
    }

    setPaying(true)
    setStep("processing")

    try {
      let bid = bookingId
      let generatedPnr = pnr
      let serverFare = fare

      if (!bid) {
        const bookingRes = await fetch("/api/booking", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ fromCity: from, toCity: to, busName }),
        })

        if (!bookingRes.ok) {
          const err = await bookingRes.json()
          throw new Error(err.error || "Failed to create booking")
        }

        const bookingData = await bookingRes.json()
        if (!bookingData.booking) {
          throw new Error(bookingData.error || "Failed to create booking")
        }
        bid = bookingData.booking.id
        generatedPnr = bookingData.booking.pnr
        serverFare = bookingData.booking.fare
        setBookingId(bid)
        setPnr(generatedPnr)
        setFare(serverFare)
      }

      const orderRes = await fetch("/api/payment/createOrder", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ bookingId: bid }),
      })

      if (!orderRes.ok) throw new Error("Failed to create payment order")

      const orderData = await orderRes.json()
      const order = orderData.order

      await loadRazorpayScript()

      if (!(window as any).Razorpay) {
        throw new Error("Razorpay failed to load")
      }

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: order.currency,
        name: "BusTiFY",
        description: `${from} → ${to}`,
        order_id: order.id,
        handler: async function (response: any) {
          try {
            const verifyRes = await fetch("/api/payment/verify", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              }),
            })

            if (verifyRes.ok) {
              setPaid(true)
              setStep("success")
              setTimeout(() => {
                router.push("/passengers/mybookings")
              }, 2500)
            } else {
              setStep("failed")
              setPaying(false)
            }
          } catch {
            setStep("failed")
            setPaying(false)
          }
        },
        modal: {
          ondismiss: function () {
            setPaying(false)
            setStep("details")
          },
        },
        theme: {
          color: "#1a1a1a",
        },
      }

      const razorpay = new (window as any).Razorpay(options)
      razorpay.open()
    } catch (err: any) {
      setStep("failed")
      setPaying(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] gap-3 text-muted-foreground">
        <Loader2 className="w-5 h-5 animate-spin" />
        <span className="mono text-[10px] tracking-widest uppercase">Loading payment details…</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="py-16 px-5 md:px-10">
        <div className="mx-auto max-w-lg text-center">
          <div className="w-14 h-14 mx-auto rounded-full bg-howrah/10 grid place-items-center mb-4">
            <AlertCircle className="w-7 h-7 text-howrah" />
          </div>
          <h2 className="display text-2xl text-ink mb-2">Payment unavailable</h2>
          <p className="text-sm text-muted-foreground mb-6">{error}</p>
          <button
            onClick={() => router.push("/passengers")}
            className="inline-flex items-center gap-2 bg-ink text-paper px-5 py-2.5 rounded-full text-sm font-medium hover:bg-tram hover:text-ink transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back to search
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="py-6 md:py-10 px-5 md:px-10 font-sans">
      <div className="mx-auto max-w-2xl">
        {/* Header */}
        <div className="flex items-end justify-between flex-wrap gap-3 mb-5">
          <button
            onClick={() => router.push("/passengers")}
            className="inline-flex items-center gap-2 text-xs text-ink/70 hover:text-ink transition-colors mono uppercase tracking-widest"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back
          </button>
          <div className="flex items-center gap-2">
            <span className="route-num text-xl text-tram">№ 07</span>
            <span className="mono text-[10px] tracking-[0.3em] uppercase text-muted-foreground">
              Payment Gateway
            </span>
          </div>
        </div>

        <h1 className="display text-3xl md:text-4xl leading-[0.95] tracking-tight text-ink mb-6">
          Complete your{" "}
          <span className="italic font-light text-muted-foreground">payment</span>
        </h1>

        {/* Step indicator */}
        <div className="flex items-center gap-2 mb-6">
          <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] mono tracking-widest uppercase ${
            step === "details" || step === "processing" ? "bg-ink text-paper" : "bg-tram/10 text-tram border border-tram/30"
          }`}>
            <span className="w-1.5 h-1.5 rounded-full bg-current" />
            Details
          </div>
          <div className="w-8 h-px bg-border" />
          <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] mono tracking-widest uppercase ${
            step === "processing" ? "bg-ink text-paper" : step === "success" || step === "failed" ? "bg-tram/10 text-tram border border-tram/30" : "bg-secondary text-muted-foreground"
          }`}>
            <span className="w-1.5 h-1.5 rounded-full bg-current" />
            Processing
          </div>
          <div className="w-8 h-px bg-border" />
          <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] mono tracking-widest uppercase ${
            step === "success" ? "bg-tram/10 text-tram border border-tram/30" : "bg-secondary text-muted-foreground"
          }`}>
            <span className="w-1.5 h-1.5 rounded-full bg-current" />
            Confirmed
          </div>
        </div>

        {/* The Payment Ticket */}
        <div className="relative">
          <div className="absolute left-0 top-[55%] -translate-x-1/2 w-6 h-6 rounded-full bg-paper z-20 ring-1 ring-border" />
          <div className="absolute right-0 top-[55%] translate-x-1/2 w-6 h-6 rounded-full bg-paper z-20 ring-1 ring-border" />

          <article className="relative bg-card rounded-3xl shadow-2xl overflow-hidden border border-ink/15">
            {/* Top dark stub */}
            <header className="bg-ink text-paper p-5 md:p-6 paper-grain relative">
              <div className="relative z-10 flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-md bg-tram text-ink grid place-items-center">
                    <CreditCard className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="mono text-[9px] tracking-[0.3em] uppercase opacity-60">
                      Secure Payment
                    </div>
                    <div className="display text-2xl md:text-3xl tracking-tight leading-none mt-0.5">
                      Bus<span className="italic text-tram">Ti</span>FY
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`stamp ${
                    paid ? "border-tram text-tram bg-ink/40" : "border-paper/40 text-paper/80"
                  }`}>
                    {paid ? "Paid" : step === "processing" ? "Processing" : "Pending"}
                  </span>
                </div>
              </div>
            </header>

            {/* Perforation strip */}
            <div className="relative bg-card h-5 flex items-center">
              <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-px ticket-stitch" />
            </div>

            {/* Body */}
            <div className="p-5 md:p-7 relative">
              {/* Route line */}
              <div className="grid grid-cols-12 items-center gap-3 mb-6">
                <div className="col-span-5">
                  <div className="mono text-[9px] tracking-widest uppercase text-muted-foreground mb-1.5">
                    From
                  </div>
                  <div className="display text-2xl md:text-3xl tracking-tight text-ink leading-none truncate">
                    {from}
                  </div>
                </div>

                <div className="col-span-2 flex flex-col items-center">
                  <div className="w-3 h-3 rounded-full bg-ink ring-4 ring-tram" />
                  <div className="w-px h-6 bg-ink/30 my-0.5 relative">
                    <Bus className="w-3.5 h-3.5 text-ink absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-card px-0.5" />
                  </div>
                  <div className="w-3 h-3 rounded-full bg-tram ring-4 ring-ink" />
                </div>

                <div className="col-span-5 text-right">
                  <div className="mono text-[9px] tracking-widest uppercase text-muted-foreground mb-1.5">
                    To
                  </div>
                  <div className="display text-2xl md:text-3xl tracking-tight text-ink leading-none truncate">
                    {to}
                  </div>
                </div>
              </div>

              {/* Route info chips */}
              <div className="flex items-center gap-3 justify-center mb-5 flex-wrap">
                <div className="flex items-center gap-1.5 mono text-[10px] tracking-widest uppercase bg-secondary px-3 py-1.5 rounded-full text-muted-foreground">
                  <Route className="w-3 h-3" /> {stopsCount} stop{stopsCount !== 1 ? "s" : ""}
                </div>
                <div className="flex items-center gap-1.5 mono text-[10px] tracking-widest uppercase bg-secondary px-3 py-1.5 rounded-full text-muted-foreground">
                  <Ruler className="w-3 h-3" /> ~{distance} km
                </div>
                {selectedBus && (
                  <div className="flex items-center gap-1.5 mono text-[10px] tracking-widest uppercase bg-secondary px-3 py-1.5 rounded-full text-muted-foreground">
                    <Bus className="w-3 h-3" /> {selectedBus.busName}
                  </div>
                )}
              </div>

              <div className="ticket-stitch h-px mb-5" />

              {/* Details grid */}
              <div className="grid grid-cols-2 gap-4 mb-5">
                <div>
                  <div className="flex items-center gap-1.5 text-muted-foreground mb-1.5">
                    <IndianRupee className="w-3.5 h-3.5" />
                    <span className="mono text-[9px] tracking-widest uppercase">Fare</span>
                  </div>
                  <div className="display text-xl md:text-2xl tracking-tight text-ink">
                    ₹{fare}
                  </div>
                </div>

                <div className="text-right">
                  <div className="flex items-center justify-end gap-1.5 text-muted-foreground mb-1.5">
                    <Calendar className="w-3.5 h-3.5" />
                    <span className="mono text-[9px] tracking-widest uppercase">Date</span>
                  </div>
                  <div className="display text-base md:text-lg tracking-tight text-ink">
                    {today}
                  </div>
                </div>

                <div>
                  <div className="flex items-center gap-1.5 text-muted-foreground mb-1.5">
                    <Clock className="w-3.5 h-3.5" />
                    <span className="mono text-[9px] tracking-widest uppercase">Time</span>
                  </div>
                  <div className="display text-base md:text-lg tracking-tight text-ink">
                    {now}
                  </div>
                </div>

                <div className="text-right">
                  <div className="flex items-center justify-end gap-1.5 text-muted-foreground mb-1.5">
                    <Ticket className="w-3.5 h-3.5" />
                    <span className="mono text-[9px] tracking-widest uppercase">Status</span>
                  </div>
                  <div className={`display text-base md:text-lg tracking-tight ${
                    paid ? "text-tram" : step === "processing" ? "text-volt" : "text-howrah"
                  }`}>
                    {paid ? "Paid" : step === "processing" ? "Processing…" : "Pending Payment"}
                  </div>
                </div>
              </div>

              {/* PNR */}
              {pnr && (
                <div className="mb-4 p-3 bg-secondary/60 rounded-xl text-center">
                  <div className="mono text-[9px] tracking-widest uppercase text-muted-foreground mb-1">
                    Booking Reference
                  </div>
                  <div className="mono text-sm tracking-widest text-ink font-medium">
                    {pnr}
                  </div>
                </div>
              )}

              {/* Payment success banner */}
              {step === "success" && (
                <div className="mt-2 bg-tram/10 border border-tram/30 rounded-xl p-5 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-tram/20 grid place-items-center shrink-0">
                    <CheckCircle2 className="w-6 h-6 text-tram" />
                  </div>
                  <div>
                    <div className="display text-lg text-ink">Payment successful!</div>
                    <div className="mono text-[10px] tracking-widest text-muted-foreground mt-0.5">
                      Redirecting to your bookings…
                    </div>
                  </div>
                </div>
              )}

              {/* Payment failed banner */}
              {step === "failed" && (
                <div className="mt-2 bg-howrah/10 border border-howrah/30 rounded-xl p-5 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-howrah/20 grid place-items-center shrink-0">
                    <AlertCircle className="w-6 h-6 text-howrah" />
                  </div>
                  <div>
                    <div className="display text-lg text-ink">Payment failed</div>
                    <div className="mono text-[10px] tracking-widest text-muted-foreground mt-0.5">
                      Please try again or contact support
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Bottom stub — Fare + Pay */}
            {!paid && step !== "success" && (
              <div className="px-5 md:px-7 pb-5 md:pb-7">
                <div className="ticket-stitch h-px mb-4" />

                <div className="bg-secondary/40 rounded-2xl p-4 md:p-5">
                  {/* Payment method selector */}
                  <div className="mb-4">
                    <div className="mono text-[9px] tracking-widest uppercase text-muted-foreground mb-3">
                      Payment Method
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <button
                        onClick={() => setPaymentMethod("razorpay")}
                        className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border transition-all ${
                          paymentMethod === "razorpay"
                            ? "border-ink bg-ink text-paper"
                            : "border-border bg-card text-muted-foreground hover:border-ink/40"
                        }`}
                      >
                        <CreditCard className="w-4 h-4" />
                        <span className="mono text-[9px] tracking-widest uppercase">Razorpay</span>
                      </button>
                      <button
                        onClick={() => setPaymentMethod("upi")}
                        className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border transition-all ${
                          paymentMethod === "upi"
                            ? "border-ink bg-ink text-paper"
                            : "border-border bg-card text-muted-foreground hover:border-ink/40"
                        }`}
                      >
                        <CircleDot className="w-4 h-4" />
                        <span className="mono text-[9px] tracking-widest uppercase">UPI</span>
                      </button>
                      <button
                        onClick={() => setPaymentMethod("card")}
                        className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border transition-all ${
                          paymentMethod === "card"
                            ? "border-ink bg-ink text-paper"
                            : "border-border bg-card text-muted-foreground hover:border-ink/40"
                        }`}
                      >
                        <Sparkles className="w-4 h-4" />
                        <span className="mono text-[9px] tracking-widest uppercase">Card</span>
                      </button>
                    </div>
                  </div>

                  {/* Fare summary */}
                  <div className="bg-card rounded-xl p-4 mb-4 border border-border">
                    <div className="flex items-center justify-between mb-2">
                      <span className="mono text-[10px] tracking-widest uppercase text-muted-foreground">
                        Route fare
                      </span>
                      <span className="mono text-sm text-ink">₹{fare}</span>
                    </div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="mono text-[10px] tracking-widest uppercase text-muted-foreground">
                        Convenience fee
                      </span>
                      <span className="mono text-sm text-ink">₹0</span>
                    </div>
                    <div className="ticket-stitch h-px my-2" />
                    <div className="flex items-center justify-between">
                      <span className="mono text-[10px] tracking-widest uppercase text-ink font-medium">
                        Total
                      </span>
                      <span className="display text-xl text-ink">₹{fare}</span>
                    </div>
                  </div>

                  {/* Pay button */}
                  <button
                    onClick={handlePayNow}
                    disabled={paying || step === "processing"}
                    className="group w-full bg-ink text-paper py-4 rounded-full font-medium flex items-center justify-center gap-2.5 hover:bg-tram hover:text-ink transition-all duration-300 disabled:opacity-60 text-sm shadow-lg hover:shadow-tram/25"
                  >
                    {step === "processing" ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Processing Payment…
                      </>
                    ) : (
                      <>
                        <Lock className="w-3.5 h-3.5" />
                        Pay ₹{fare}
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </>
                    )}
                  </button>

                  {/* Security badges */}
                  <div className="flex items-center justify-center gap-4 mt-4">
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <Shield className="w-3 h-3" />
                      <span className="mono text-[9px] tracking-widest uppercase">256-bit SSL</span>
                    </div>
                    <div className="w-px h-3 bg-border" />
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <Lock className="w-3 h-3" />
                      <span className="mono text-[9px] tracking-widest uppercase">PCI DSS</span>
                    </div>
                    <div className="w-px h-3 bg-border" />
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <CheckCircle2 className="w-3 h-3" />
                      <span className="mono text-[9px] tracking-widest uppercase">Secure</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Success bottom stub */}
            {paid && step === "success" && (
              <div className="px-5 md:px-7 pb-5 md:pb-7">
                <div className="ticket-stitch h-px mb-4" />
                <div className="text-center">
                  <button
                    onClick={() => router.push("/passengers/mybookings")}
                    className="inline-flex items-center gap-2 bg-ink text-paper px-6 py-3 rounded-full text-sm font-medium hover:bg-tram hover:text-ink transition-colors"
                  >
                    View My Bookings
                    <ArrowUpRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </article>
        </div>

        {/* Info note */}
        <div className="mt-5 flex items-center justify-center gap-2">
          <Lock className="w-3 h-3 text-muted-foreground" />
          <p className="mono text-[10px] tracking-widest text-muted-foreground">
            Secured by Razorpay · Show ticket to conductor on boarding
          </p>
        </div>
      </div>
    </div>
  )
}

export default function PaymentPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-[60vh] gap-3 text-muted-foreground">
        <Loader2 className="w-5 h-5 animate-spin" />
        <span className="mono text-[10px] tracking-widest uppercase">Loading payment…</span>
      </div>
    }>
      <PaymentPageContent />
    </Suspense>
  )
}
