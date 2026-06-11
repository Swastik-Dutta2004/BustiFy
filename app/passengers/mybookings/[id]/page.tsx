"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import {
  Ticket, MapPin, Bus, Calendar, Clock, IndianRupee,
  Loader2, ArrowLeft, CheckCircle2, XCircle, Printer, Download
} from "lucide-react"

interface Booking {
  id: number
  fromCity: string
  toCity: string
  fare: number
  pnr: string
  paymentStatus: string
  razorpayOrderId: string | null
  razorpayPaymentId: string | null
}

export default function BookingDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const [booking, setBooking] = useState<Booking | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  const today = new Date().toLocaleDateString("en-IN", {
    day: "numeric", month: "short", year: "numeric",
  })
  const now = new Date().toLocaleTimeString("en-IN", {
    hour: "2-digit", minute: "2-digit",
  })

  useEffect(() => {
    async function fetchBooking() {
      const token = localStorage.getItem("token")
      if (!token) {
        router.push("/login")
        return
      }

      try {
        const res = await fetch(`/api/booking/${params.id}`, {
          headers: { Authorization: `Bearer ${token}` },
        })

        if (!res.ok) throw new Error("Failed to fetch booking")

        const data = await res.json()
        setBooking(data)
      } catch (err) {
        setError("Could not load booking details")
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    if (params.id) fetchBooking()
  }, [params.id, router])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] gap-3 text-muted-foreground">
        <Loader2 className="w-5 h-5 animate-spin" />
        <span className="mono text-[10px] tracking-widest uppercase">Loading ticket…</span>
      </div>
    )
  }

  if (error || !booking) {
    return (
      <div className="py-16 px-5 md:px-10">
        <div className="mx-auto max-w-lg text-center">
          <div className="w-14 h-14 mx-auto rounded-full bg-howrah/10 grid place-items-center mb-4">
            <XCircle className="w-7 h-7 text-howrah" />
          </div>
          <h2 className="display text-2xl text-ink mb-2">Ticket not found</h2>
          <p className="text-sm text-muted-foreground mb-6">{error || "This booking does not exist."}</p>
          <button
            onClick={() => router.push("/passengers/mybookings")}
            className="inline-flex items-center gap-2 bg-ink text-paper px-5 py-2.5 rounded-full text-sm font-medium hover:bg-tram hover:text-ink transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back to bookings
          </button>
        </div>
      </div>
    )
  }

  const isPaid = booking.paymentStatus === "PAID"

  return (
    <div className="py-6 md:py-10 px-5 md:px-10 font-sans">
      <div className="mx-auto max-w-3xl">
        {/* Header */}
        <div className="flex items-end justify-between flex-wrap gap-3 mb-5 no-print">
          <button
            onClick={() => router.push("/passengers/mybookings")}
            className="inline-flex items-center gap-2 text-xs text-ink/70 hover:text-ink transition-colors mono uppercase tracking-widest"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back
          </button>
          <div className="flex items-center gap-3">
            {isPaid ? (
              <CheckCircle2 className="w-5 h-5 text-tram" />
            ) : (
              <XCircle className="w-5 h-5 text-howrah" />
            )}
            <div>
              <div className={`display text-lg leading-none ${isPaid ? "text-tram" : "text-howrah"}`}>
                {isPaid ? "Confirmed" : "Pending"}
              </div>
              <div className="mono text-[10px] tracking-widest text-muted-foreground mt-0.5">
                {today} · {now}
              </div>
            </div>
          </div>
        </div>

        {/* Headline */}
        <div className="mb-5">
          <h1 className="display text-3xl md:text-5xl leading-[0.95] tracking-tight text-ink">
            {booking.fromCity} <span className="text-tram">→</span>{" "}
            <span className="italic font-light text-muted-foreground">{booking.toCity}</span>
          </h1>
        </div>

        {/* ── Boarding Pass ──────────────────────────── */}
        <div className="relative">
          <div className="absolute left-0 top-[60%] -translate-x-1/2 w-6 h-6 rounded-full bg-paper z-20 ring-1 ring-border" />
          <div className="absolute right-0 top-[60%] translate-x-1/2 w-6 h-6 rounded-full bg-paper z-20 ring-1 ring-border" />

          <article className="relative bg-card rounded-3xl shadow-2xl overflow-hidden border border-ink/15">
            {/* Top dark stub */}
            <header className="bg-ink text-paper p-5 md:p-6 paper-grain relative">
              <div className="relative z-10 flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-md bg-tram text-ink grid place-items-center">
                    <Bus className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="mono text-[9px] tracking-[0.3em] uppercase opacity-60">
                      Boarding Pass
                    </div>
                    <div className="display text-2xl md:text-3xl tracking-tight leading-none mt-0.5">
                      Bus<span className="italic text-tram">Ti</span>FY
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="mono text-[9px] tracking-widest uppercase opacity-60 mb-0.5">
                    PNR
                  </div>
                  <div className="mono text-base md:text-lg font-medium tracking-widest">
                    {booking.pnr}
                  </div>
                </div>
              </div>
              <div className="relative z-10 mt-4 flex items-center gap-2.5 flex-wrap">
                <span className={`stamp ${isPaid ? "text-tram border-tram" : "text-howrah border-howrah"} bg-ink/40`}>
                  {isPaid ? "Paid" : "Pending"}
                </span>
                <span className="mono text-[10px] tracking-widest uppercase opacity-60">
                  {today} · {now}
                </span>
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
                    Origin
                  </div>
                  <div className="display text-2xl md:text-4xl tracking-tight text-ink leading-none">
                    {booking.fromCity}
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
                    Destination
                  </div>
                  <div className="display text-2xl md:text-4xl tracking-tight text-ink leading-none">
                    {booking.toCity}
                  </div>
                </div>
              </div>

              <div className="ticket-stitch h-px mb-5" />

              {/* Details grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <div className="flex items-center gap-1.5 text-muted-foreground mb-1.5">
                    <Calendar className="w-3.5 h-3.5" />
                    <span className="mono text-[9px] tracking-widest uppercase">Date</span>
                  </div>
                  <div className="display text-base md:text-xl tracking-tight text-ink">
                    {today}
                  </div>
                </div>
                <div>
                  <div className="flex items-center gap-1.5 text-muted-foreground mb-1.5">
                    <IndianRupee className="w-3.5 h-3.5" />
                    <span className="mono text-[9px] tracking-widest uppercase">Fare</span>
                  </div>
                  <div className="display text-base md:text-xl tracking-tight text-ink">
                    ₹{booking.fare}
                  </div>
                </div>
                <div>
                  <div className="flex items-center gap-1.5 text-muted-foreground mb-1.5">
                    <Clock className="w-3.5 h-3.5" />
                    <span className="mono text-[9px] tracking-widest uppercase">Status</span>
                  </div>
                  <div className={`display text-base md:text-xl tracking-tight ${isPaid ? "text-tram" : "text-howrah"}`}>
                    {isPaid ? "Confirmed" : "Pending"}
                  </div>
                </div>
                <div>
                  <div className="flex items-center gap-1.5 text-muted-foreground mb-1.5">
                    <Ticket className="w-3.5 h-3.5" />
                    <span className="mono text-[9px] tracking-widest uppercase">Payment</span>
                  </div>
                  <div className={`display text-base md:text-xl tracking-tight ${isPaid ? "text-tram" : "text-howrah"}`}>
                    {isPaid ? "Paid" : "Pending"}
                  </div>
                </div>
              </div>

              {/* Bottom stub — Fare + PNR */}
              <div className="mt-6 -mx-5 md:-mx-7 px-5 md:px-7 py-4 border-t-2 border-dashed border-ink/20 bg-secondary/30 flex items-end justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-11 h-11 grid place-items-center bg-ink text-paper rounded-lg">
                    <Ticket className="w-5 h-5 text-tram" />
                  </div>
                  <div>
                    <div className="mono text-[9px] tracking-widest text-muted-foreground">
                      SCAN AT ENTRY
                    </div>
                    <div className="font-mono text-xs tracking-widest text-ink mt-0.5">
                      {booking.pnr}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="mono text-[9px] tracking-widest text-muted-foreground">
                    FARE
                  </div>
                  <div className="display text-2xl md:text-3xl text-ink leading-none">
                    ₹{booking.fare}
                  </div>
                </div>
              </div>
            </div>
          </article>
        </div>

        {/* Actions */}
        <div className="mt-5 flex gap-2.5 no-print">
          <button
            onClick={() => window.print()}
            className="flex-1 bg-ink text-paper py-3.5 rounded-full font-medium flex items-center justify-center gap-2 hover:bg-tram hover:text-ink transition-colors text-sm"
          >
            <Printer className="w-4 h-4" /> Print ticket
          </button>
          <button className="flex-1 border-2 border-ink text-ink py-3.5 rounded-full font-medium flex items-center justify-center gap-2 hover:bg-ink hover:text-paper transition-colors text-sm">
            <Download className="w-4 h-4" /> Download PDF
          </button>
        </div>

        <p className="mono text-[10px] tracking-widest uppercase text-muted-foreground text-center mt-5 no-print">
          Carry this ticket for the entire journey · No transfers included
        </p>
      </div>

      <style jsx global>{`
        @media print {
          .no-print { display: none !important; }
          body { background: white !important; }
        }
      `}</style>
    </div>
  )
}
