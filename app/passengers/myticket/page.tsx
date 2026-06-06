"use client"

import { useSearchParams, useRouter } from "next/navigation"
import { Ticket, MapPin, Calendar, Users, ArrowLeft, Printer, Download, Bus, CheckCircle2, Clock } from "lucide-react"

export default function TicketPage() {
  const Params = useSearchParams()
  const router = useRouter()

  const busID = Params.get("busId") || "—"
  const busTo = Params.get("to") || "—"
  const busfrom = Params.get("from") || "—"
  const busDate = Params.get("date") || "—"
  const busPassengers = Params.get("passengers") || "1"
  const busTotalPrice = Params.get("price") || "0"
  const busSeats = Params.get("seats") || ""
  const ticketId = `BT-${(busID || "000").toString().padStart(4, "0")}-${(busDate || "X").replace(/[^0-9]/g, "").slice(-6) || "000000"}`
  const today = new Date().toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  })
  const now = new Date().toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
  })

  return (
    <div className="py-6 md:py-10 px-5 md:px-10 font-sans">
      <div className="mx-auto max-w-3xl">
        {/* Header */}
        <div className="flex items-end justify-between flex-wrap gap-3 mb-5 no-print">
          <button
            onClick={() => router.back()}
            className="inline-flex items-center gap-2 text-xs text-ink/70 hover:text-ink transition-colors mono uppercase tracking-widest"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back
          </button>
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-tram" />
            <div>
              <div className="display text-lg text-ink leading-none">Confirmed</div>
              <div className="mono text-[10px] tracking-widest text-muted-foreground mt-0.5">
                {today} · {now}
              </div>
            </div>
          </div>
        </div>

        {/* Success headline */}
        <div className="mb-5 reveal reveal-1">
          <h1 className="display text-3xl md:text-5xl leading-[0.95] tracking-tight text-ink">
            You&apos;re on the <span className="italic font-light text-tram">bus.</span>
          </h1>
          <p className="mt-3 text-sm md:text-base text-ink/70 max-w-lg">
            Show this digital ticket to the conductor — or print it, if that&apos;s
            how your nana rolls.
          </p>
        </div>

        {/* ── The Boarding Pass ──────────────────────────── */}
        <div className="relative">
          {/* Side notches aligned with perforation */}
          <div className="absolute left-0 top-[60%] -translate-x-1/2 w-6 h-6 rounded-full bg-paper z-20 ring-1 ring-border" />
          <div className="absolute right-0 top-[60%] translate-x-1/2 w-6 h-6 rounded-full bg-paper z-20 ring-1 ring-border" />

          <article className="relative bg-card rounded-3xl shadow-2xl overflow-hidden border border-ink/15 reveal reveal-2">
            {/* Top dark stub — Bus line */}
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
                    {ticketId}
                  </div>
                </div>
              </div>
              <div className="relative z-10 mt-4 flex items-center gap-2.5 flex-wrap">
                <span className="stamp text-tram border-tram bg-ink/40">Active</span>
                <span className="mono text-[10px] tracking-widest uppercase opacity-60">
                  {busDate} · {now}
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
                    {busfrom}
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
                    {busTo}
                  </div>
                </div>
              </div>

              {/* Details — ticket-stitch divided */}
              <div className="ticket-stitch h-px mb-5" />

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  {
                    icon: <Calendar className="w-3.5 h-3.5" />,
                    label: "Date",
                    val: busDate,
                  },
                  {
                    icon: <Users className="w-3.5 h-3.5" />,
                    label: "Pax",
                    val: `${busPassengers}`,
                  },
                  {
                    icon: <MapPin className="w-3.5 h-3.5" />,
                    label: "Seats",
                    val: busSeats || "—",
                  },
                  {
                    icon: <Clock className="w-3.5 h-3.5" />,
                    label: "Status",
                    val: "Confirmed",
                    color: "text-tram",
                  },
                ].map((d, i) => (
                  <div key={i}>
                    <div className="flex items-center gap-1.5 text-muted-foreground mb-1.5">
                      {d.icon}
                      <span className="mono text-[9px] tracking-widest uppercase">
                        {d.label}
                      </span>
                    </div>
                    <div
                      className={`display text-base md:text-xl tracking-tight truncate ${
                        d.color || "text-ink"
                      }`}
                    >
                      {d.val}
                    </div>
                  </div>
                ))}
              </div>

              {/* Bottom stub — Fare */}
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
                      {ticketId}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="mono text-[9px] tracking-widest text-muted-foreground">
                    FARE
                  </div>
                  <div className="display text-2xl md:text-3xl text-ink leading-none">
                    ₹{busTotalPrice}
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
