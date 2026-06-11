"use client"

import { Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { useEffect, useState, useCallback } from "react"
import {
  ArrowLeft, MapPin, Bus, Clock, Ticket,
  Loader2, ArrowRight, Route, Ruler, IndianRupee,
  AlertCircle, CheckCircle2, Calendar
} from "lucide-react"

interface BusData {
  id: number
  busName: string
  fromCity: string
  toCity: string
  price: number
  stops: string[]
}

function TicketPageContent() {
  const params = useSearchParams()
  const router = useRouter()

  const from = params.get("from") || ""
  const to = params.get("to") || ""

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [stopsCount, setStopsCount] = useState(0)
  const [fare, setFare] = useState(0)
  const [distance, setDistance] = useState(0)
  const [bookingId, setBookingId] = useState<number | null>(null)
  const [paying, setPaying] = useState(false)
  const [paid, setPaid] = useState(false)
  const [pnr, setPnr] = useState("")

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
        const busList: BusData[] = data.buses ?? []

        if (busList.length === 0) {
          setError("No buses available on this route")
          setLoading(false)
          return
        }

        const stops = busList[0].stops || []
        const fromIdx = stops.findIndex((s: string) => s.toLowerCase() === from.toLowerCase())
        const toIdx = stops.findIndex((s: string) => s.toLowerCase() === to.toLowerCase())
        let betweenStops: string[] = []
        if (fromIdx !== -1 && toIdx !== -1 && fromIdx < toIdx) {
          betweenStops = stops.slice(fromIdx + 1, toIdx)
        } else if (stops.length > 0) {
          betweenStops = stops
        }
        setStopsCount(betweenStops.length)
        setDistance(Math.max(Math.round(betweenStops.length * 1.5), 2))

        const minPrice = Math.min(...busList.map((b: BusData) => b.price))
        setFare(minPrice)
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

    try {
      const bookingRes = await fetch("/api/booking", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ fromCity: from, toCity: to, fare }),
      })

      if (!bookingRes.ok) {
        const err = await bookingRes.json()
        throw new Error(err.error || "Failed to create booking")
      }

      const bookingData = await bookingRes.json()
      const bid = bookingData.booking.id
      const generatedPnr = bookingData.booking.pnr
      setBookingId(bid)
      setPnr(generatedPnr)

      const orderRes = await fetch("/api/payment/createOrder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
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
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              }),
            })

            if (verifyRes.ok) {
              setPaid(true)
              setTimeout(() => {
                router.push("/passengers/mybookings")
              }, 1500)
            } else {
              alert("Payment verification failed. Please contact support.")
              setPaying(false)
            }
          } catch {
            alert("Payment verification failed. Please contact support.")
            setPaying(false)
          }
        },
        modal: {
          ondismiss: function () {
            setPaying(false)
          },
        },
        theme: {
          color: "#1a1a1a",
        },
      }

      const razorpay = new (window as any).Razorpay(options)
      razorpay.open()
    } catch (err: any) {
      alert(err.message || "Payment failed. Please try again.")
      setPaying(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] gap-3 text-muted-foreground">
        <Loader2 className="w-5 h-5 animate-spin" />
        <span className="mono text-[10px] tracking-widest uppercase">Loading route details…</span>
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
          <h2 className="display text-2xl text-ink mb-2">Route unavailable</h2>
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
      <div className="mx-auto max-w-lg">
        {/* Header */}
        <div className="flex items-end justify-between flex-wrap gap-3 mb-5">
          <button
            onClick={() => router.push("/passengers")}
            className="inline-flex items-center gap-2 text-xs text-ink/70 hover:text-ink transition-colors mono uppercase tracking-widest"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back
          </button>
          <div className="flex items-center gap-2">
            <span className="route-num text-xl text-tram">№ 08</span>
            <span className="mono text-[10px] tracking-[0.3em] uppercase text-muted-foreground">
              Route Ticket
            </span>
          </div>
        </div>

        <h1 className="display text-3xl md:text-4xl leading-[0.95] tracking-tight text-ink mb-6">
          Your{" "}
          <span className="italic font-light text-muted-foreground">route</span>{" "}
          ticket
        </h1>

        {/* The Ticket */}
        <div className="relative">
          <div className="absolute left-0 top-[55%] -translate-x-1/2 w-6 h-6 rounded-full bg-paper z-20 ring-1 ring-border" />
          <div className="absolute right-0 top-[55%] translate-x-1/2 w-6 h-6 rounded-full bg-paper z-20 ring-1 ring-border" />

          <article className="relative bg-card rounded-3xl shadow-2xl overflow-hidden border border-ink/15">
            {/* Top dark stub */}
            <header className="bg-ink text-paper p-5 md:p-6 paper-grain relative">
              <div className="relative z-10 flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-md bg-tram text-ink grid place-items-center">
                    <Ticket className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="mono text-[9px] tracking-[0.3em] uppercase opacity-60">
                      Digital Ticket
                    </div>
                    <div className="display text-2xl md:text-3xl tracking-tight leading-none mt-0.5">
                      Bus<span className="italic text-tram">Ti</span>FY
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <span className="stamp border-tram text-tram bg-ink/40">
                    {paid ? "Paid" : "Pending"}
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
              </div>

              <div className="ticket-stitch h-px mb-5" />

              {/* Details grid */}
              <div className="grid grid-cols-2 gap-4">
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
                  <div className={`display text-base md:text-lg tracking-tight ${paid ? "text-tram" : "text-howrah"}`}>
                    {paid ? "Paid" : "Pending Payment"}
                  </div>
                </div>
              </div>

              {/* PNR */}
              {pnr && (
                <div className="mt-4 text-center">
                  <div className="mono text-[9px] tracking-widest uppercase text-muted-foreground mb-1">
                    PNR
                  </div>
                  <div className="mono text-sm tracking-widest text-ink font-medium">
                    {pnr}
                  </div>
                </div>
              )}

              {/* Payment success banner */}
              {paid && (
                <div className="mt-5 bg-tram/10 border border-tram/30 rounded-xl p-4 flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-tram shrink-0" />
                  <div>
                    <div className="display text-base text-ink">Payment successful!</div>
                    <div className="mono text-[10px] tracking-widest text-muted-foreground mt-0.5">
                      Redirecting to your bookings…
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Bottom stub — Fare + Pay */}
            {!paid && (
              <div className="px-5 md:px-7 pb-5 md:pb-7">
                <div className="ticket-stitch h-px mb-4" />

                <div className="bg-secondary/40 rounded-2xl p-4 md:p-5">
                  <div className="flex items-end justify-between mb-4">
                    <div>
                      <div className="mono text-[9px] tracking-widest uppercase text-muted-foreground">
                        Total Fare
                      </div>
                      <div className="display text-2xl md:text-3xl text-ink leading-none mt-1">
                        ₹{fare}
                      </div>
                    </div>
                    <div className="mono text-[9px] tracking-widest uppercase text-muted-foreground text-right">
                      Route ticket<br />No seat selection
                    </div>
                  </div>

                  <button
                    onClick={handlePayNow}
                    disabled={paying}
                    className="group w-full bg-ink text-paper py-3.5 rounded-full font-medium flex items-center justify-center gap-2 hover:bg-tram hover:text-ink transition-colors duration-300 disabled:opacity-60 text-sm"
                  >
                    {paying ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Processing…
                      </>
                    ) : (
                      <>
                        Pay Now
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </>
                    )}
                  </button>

                  <p className="mono text-[9px] tracking-widest uppercase text-muted-foreground text-center mt-3">
                    Powered by Razorpay · 256-bit secure
                  </p>
                </div>
              </div>
            )}
          </article>
        </div>

        {/* Info note */}
        <p className="mono text-[10px] tracking-widest text-muted-foreground text-center mt-5">
          This ticket is valid for the route · Show to conductor on boarding
        </p>
      </div>
    </div>
  )
}

export default function TicketPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-[60vh] gap-3 text-muted-foreground">
        <Loader2 className="w-5 h-5 animate-spin" />
        <span className="mono text-[10px] tracking-widest uppercase">Loading ticket…</span>
      </div>
    }>
      <TicketPageContent />
    </Suspense>
  )
}
