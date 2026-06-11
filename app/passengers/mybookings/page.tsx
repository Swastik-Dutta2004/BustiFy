"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import {
  Ticket, MapPin, Bus, Calendar, Clock, IndianRupee,
  Loader2, ArrowLeft, AlertCircle, ArrowRight, CheckCircle2, XCircle
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

export default function MyBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const router = useRouter()

  useEffect(() => {
    async function fetchBookings() {
      const token = localStorage.getItem("token")
      if (!token) {
        router.push("/login")
        return
      }

      try {
        const res = await fetch("/api/myBooking", {
          headers: { Authorization: `Bearer ${token}` },
        })

        if (!res.ok) throw new Error("Failed to fetch bookings")

        const data = await res.json()
        setBookings(Array.isArray(data) ? data : [])
      } catch (err) {
        setError("Could not load your bookings")
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchBookings()
  }, [router])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] gap-3 text-muted-foreground">
        <Loader2 className="w-5 h-5 animate-spin" />
        <span className="mono text-[10px] tracking-widest uppercase">Loading your bookings…</span>
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
          <h2 className="display text-2xl text-ink mb-2">Something went wrong</h2>
          <p className="text-sm text-muted-foreground mb-6">{error}</p>
          <button
            onClick={() => router.refresh()}
            className="inline-flex items-center gap-2 bg-ink text-paper px-5 py-2.5 rounded-full text-sm font-medium hover:bg-tram hover:text-ink transition-colors"
          >
            Try again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="py-6 md:py-10 px-5 md:px-10 font-sans">
      <div className="mx-auto max-w-3xl">
        {/* Header */}
        <div className="flex items-end justify-between flex-wrap gap-3 mb-6">
          <button
            onClick={() => router.push("/passengers")}
            className="inline-flex items-center gap-2 text-xs text-ink/70 hover:text-ink transition-colors mono uppercase tracking-widest"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Search routes
          </button>
          <div className="flex items-center gap-2">
            <span className="route-num text-xl text-tram">№ 09</span>
            <span className="mono text-[10px] tracking-[0.3em] uppercase text-muted-foreground">
              My Bookings
            </span>
          </div>
        </div>

        <h1 className="display text-3xl md:text-5xl leading-[0.95] tracking-tight text-ink mb-6">
          Your{" "}
          <span className="italic font-light text-muted-foreground">bookings</span>
        </h1>

        {bookings.length === 0 ? (
          <div className="border-2 border-dashed border-border rounded-3xl p-12 text-center">
            <Ticket className="w-10 h-10 mx-auto text-muted-foreground/30 mb-3" />
            <h3 className="display text-xl text-ink mb-1.5">No bookings yet</h3>
            <p className="text-muted-foreground text-sm mb-4">
              Search for a route and generate a ticket to get started.
            </p>
            <button
              onClick={() => router.push("/passengers")}
              className="inline-flex items-center gap-2 bg-ink text-paper px-5 py-2.5 rounded-full text-sm font-medium hover:bg-tram hover:text-ink transition-colors"
            >
              Search routes
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {bookings.map((booking, index) => (
              <Link
                key={booking.id}
                href={`/passengers/mybookings/${booking.id}`}
                className="block group"
              >
                <article className="relative bg-card border border-border rounded-2xl overflow-hidden hover:border-ink hover:shadow-xl transition-all reveal cursor-pointer">
                  <div className="p-4 md:p-5">
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-md bg-ink text-paper grid place-items-center">
                          <Bus className="w-4 h-4 text-tram" />
                        </div>
                        <div>
                          <div className="mono text-[9px] tracking-widest uppercase text-muted-foreground">
                            PNR · {booking.pnr || `BT-${String(booking.id).padStart(4, "0")}`}
                          </div>
                          <div className="display text-base text-ink leading-tight mt-0.5">
                            {booking.fromCity} → {booking.toCity}
                          </div>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <span
                          className={`stamp text-[8px] ${
                            booking.paymentStatus === "PAID"
                              ? "text-tram border-tram"
                              : "text-howrah border-howrah"
                          }`}
                        >
                          {booking.paymentStatus === "PAID" ? "Paid" : "Pending"}
                        </span>
                      </div>
                    </div>

                    <div className="ticket-stitch h-px mb-3" />

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      <div>
                        <div className="flex items-center gap-1 text-muted-foreground mb-0.5">
                          <MapPin className="w-3 h-3" />
                          <span className="mono text-[9px] tracking-widest uppercase">From</span>
                        </div>
                        <div className="display text-sm text-ink truncate">{booking.fromCity}</div>
                      </div>
                      <div>
                        <div className="flex items-center gap-1 text-muted-foreground mb-0.5">
                          <MapPin className="w-3 h-3" />
                          <span className="mono text-[9px] tracking-widest uppercase">To</span>
                        </div>
                        <div className="display text-sm text-ink truncate">{booking.toCity}</div>
                      </div>
                      <div>
                        <div className="flex items-center gap-1 text-muted-foreground mb-0.5">
                          <IndianRupee className="w-3 h-3" />
                          <span className="mono text-[9px] tracking-widest uppercase">Fare</span>
                        </div>
                        <div className="display text-sm text-ink">₹{booking.fare}</div>
                      </div>
                      <div>
                        <div className="flex items-center gap-1 text-muted-foreground mb-0.5">
                          {booking.paymentStatus === "PAID" ? (
                            <CheckCircle2 className="w-3 h-3 text-tram" />
                          ) : (
                            <XCircle className="w-3 h-3 text-howrah" />
                          )}
                          <span className="mono text-[9px] tracking-widest uppercase">Status</span>
                        </div>
                        <div
                          className={`display text-sm ${
                            booking.paymentStatus === "PAID" ? "text-tram" : "text-howrah"
                          }`}
                        >
                          {booking.paymentStatus === "PAID" ? "Confirmed" : "Pending"}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Bottom accent bar */}
                  <div
                    className={`h-1 w-full ${
                      booking.paymentStatus === "PAID" ? "bg-tram" : "bg-ink/20"
                    }`}
                  />
                </article>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
