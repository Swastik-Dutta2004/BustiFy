"use client"

import { useSearchParams, useRouter } from "next/navigation"
import { useState } from "react"
import { ArrowLeft, ArrowRight, Bus, Check, Ticket, Calendar, Users, MapPin } from "lucide-react"

const ROWS = 8
const COLS = 4 // 2-2 layout with aisle

export default function BuyTicketPage() {
  const Params = useSearchParams()
  const router = useRouter()

  const busID = Params.get("busId") || "—"
  const busTo = Params.get("to") || "—"
  const busfrom = Params.get("from") || "—"
  const busDate = Params.get("date") || "—"
  const busPassengers = Number(Params.get("passengers") || 1)
  const busTotalPrice = Params.get("price") || "—"

  const [seats, setSeats] = useState<string[]>([])
  const max = busPassengers

  const toggleSeat = (id: string) => {
    setSeats((prev) => {
      if (prev.includes(id)) return prev.filter((s) => s !== id)
      if (prev.length >= max) return prev
      return [...prev, id]
    })
  }

  const totalSelected = seats.length
  const taken = ["R1-1", "R1-4", "R3-2", "R4-3", "R6-1", "R7-4", "R8-2"]
  const pnr = `BT-${(busID || "000").toString().padStart(4, "0")}-${(busDate || "X").replace(/[^0-9]/g, "").slice(-6) || "000000"}`

  return (
    <div className="pb-12">
      <section className="border-b border-ink/15 bg-paper">
        <div className="mx-auto max-w-[1400px] px-5 md:px-10 pt-7 md:pt-10 pb-5 md:pb-6">
          <div className="flex items-end justify-between flex-wrap gap-3 mb-5">
            <button
              onClick={() => router.back()}
              className="inline-flex items-center gap-2 text-xs text-ink/70 hover:text-ink transition-colors mono uppercase tracking-widest"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back
            </button>
            <div className="flex items-center gap-3">
              <span className="route-num text-xl text-tram">№ 07</span>
              <span className="mono text-[10px] tracking-[0.3em] uppercase text-muted-foreground">
                Seat selection
              </span>
              <span className="stamp text-tram border-tram">Step 2 / 3</span>
            </div>
          </div>

          <h1 className="display text-3xl md:text-5xl leading-[0.95] tracking-tight text-ink max-w-3xl">
            Pick your <br />
            <span className="italic font-light text-muted-foreground">seat, traveller.</span>
          </h1>
        </div>
      </section>

      <main className="mx-auto max-w-[1400px] px-5 md:px-10 pt-8 grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* ── LEFT: Seat map ────────────────────────────── */}
        <div className="lg:col-span-7">
          <div className="bg-card border border-border rounded-3xl p-5 md:p-7">
            <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
              <div>
                <div className="mono text-[10px] tracking-widest uppercase text-muted-foreground">
                  Layout · 2 × 2
                </div>
                <h2 className="display text-xl text-ink mt-0.5">Choose seats</h2>
              </div>
              <div className="flex items-center gap-3 text-[10px] mono uppercase tracking-widest">
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded border-2 border-ink" /> Available
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded bg-ink" /> Yours
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded bg-ink/20" /> Taken
                </span>
              </div>
            </div>

            {/* Bus front indicator */}
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full border-2 border-ink grid place-items-center">
                <Bus className="w-4 h-4 text-ink" />
              </div>
              <div>
                <div className="mono text-[9px] tracking-widest uppercase text-muted-foreground">
                  Front of bus
                </div>
                <div className="display text-base text-ink leading-none">Driver</div>
              </div>
            </div>

            <div className="ticket-stitch h-px mb-4" />

            {/* Seat grid */}
            <div className="space-y-2">
              {Array.from({ length: ROWS }).map((_, r) => (
                <div key={r} className="flex items-center gap-2.5 justify-center">
                  <span className="route-num text-base text-muted-foreground w-5 shrink-0">
                    {r + 1}
                  </span>
                  <div className="grid grid-cols-4 gap-2.5 flex-1 max-w-sm">
                    {Array.from({ length: COLS }).map((__, c) => {
                      const id = `R${r + 1}-${c + 1}`
                      const isTaken = taken.includes(id)
                      const isSelected = seats.includes(id)
                      const isAisle = c === 1 || c === 2
                      const disabled = isTaken || (!isSelected && totalSelected >= max)

                      return (
                        <button
                          key={id}
                          onClick={() => !isTaken && toggleSeat(id)}
                          disabled={isTaken}
                          className={`
                            h-10 rounded-lg border-2 mono text-[10px] font-medium tracking-widest transition-all
                            ${isAisle ? "mr-2.5" : ""}
                            ${
                              isTaken
                                ? "bg-ink/15 border-ink/10 text-muted-foreground line-through cursor-not-allowed"
                                : isSelected
                                ? "bg-ink text-paper border-ink scale-105"
                                : disabled
                                ? "bg-card border-ink/10 text-muted-foreground/50 cursor-not-allowed"
                                : "bg-card border-ink/30 hover:border-ink text-ink hover:scale-105"
                            }
                          `}
                        >
                          {id.replace("R", "")}
                          {isSelected && <Check className="inline w-2.5 h-2.5 ml-0.5" />}
                        </button>
                      )
                    })}
                  </div>
                  <span className="route-num text-base text-muted-foreground w-5 shrink-0">
                    {r + 1}
                  </span>
                </div>
              ))}
            </div>

            <div className="ticket-stitch h-px mt-4 mb-2" />
            <div className="flex items-center justify-center gap-2 mono text-[9px] tracking-widest uppercase text-muted-foreground">
              <span>Rear · Door</span>
            </div>
          </div>
        </div>

        {/* ── RIGHT: Ticket Summary ────────────────────────────── */}
        <aside className="lg:col-span-5">
          <div className="sticky top-32 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="route-num text-xl text-tram">F·04</span>
                <span className="mono text-[10px] tracking-[0.3em] uppercase text-muted-foreground">
                  Your trip
                </span>
              </div>
              <span className="stamp text-tram border-tram">Active</span>
            </div>

            {/* ── Boarding Pass Ticket ── */}
            <div className="relative">
              {/* Side notches aligned with perforation */}
              <div className="absolute left-0 top-[68%] -translate-x-1/2 w-5 h-5 rounded-full bg-paper z-20 ring-1 ring-border" />
              <div className="absolute right-0 top-[68%] translate-x-1/2 w-5 h-5 rounded-full bg-paper z-20 ring-1 ring-border" />

              <article className="relative bg-card rounded-2xl overflow-hidden border border-ink/20 shadow-xl">
                {/* Top dark stub */}
                <header className="bg-ink text-paper p-4 paper-grain relative">
                  <div className="relative z-10 flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-md bg-tram text-ink grid place-items-center">
                        <Bus className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="mono text-[9px] tracking-[0.3em] uppercase opacity-60">
                          Boarding Pass
                        </div>
                        <div className="display text-lg tracking-tight leading-none mt-0.5">
                          Bus<span className="italic text-tram">Ti</span>FY
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="mono text-[9px] tracking-widest uppercase opacity-60">
                        PNR
                      </div>
                      <div className="mono text-xs font-medium tracking-widest">
                        {pnr}
                      </div>
                    </div>
                  </div>
                </header>

                {/* Perforation */}
                <div className="relative bg-card h-4 flex items-center">
                  <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-px ticket-stitch" />
                </div>

                {/* Body */}
                <div className="p-4 relative">
                  {/* Route line */}
                  <div className="grid grid-cols-12 items-center gap-2 mb-4">
                    <div className="col-span-5">
                      <div className="mono text-[9px] tracking-widest uppercase text-muted-foreground mb-1">
                        Origin
                      </div>
                      <div className="display text-xl md:text-2xl tracking-tight text-ink leading-none">
                        {busfrom}
                      </div>
                    </div>

                    <div className="col-span-2 flex flex-col items-center">
                      <div className="w-2.5 h-2.5 rounded-full bg-ink ring-2 ring-tram" />
                      <div className="w-px h-4 bg-ink/30 my-0.5 relative">
                        <Bus className="w-3 h-3 text-ink absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-card px-0.5" />
                      </div>
                      <div className="w-2.5 h-2.5 rounded-full bg-tram ring-2 ring-ink" />
                    </div>

                    <div className="col-span-5 text-right">
                      <div className="mono text-[9px] tracking-widest uppercase text-muted-foreground mb-1">
                        Destination
                      </div>
                      <div className="display text-xl md:text-2xl tracking-tight text-ink leading-none">
                        {busTo}
                      </div>
                    </div>
                  </div>

                  {/* Details grid */}
                  <div className="ticket-stitch h-px mb-3" />

                  <div className="grid grid-cols-2 gap-3">
                    {[
                      {
                        icon: <Calendar className="w-3 h-3" />,
                        label: "Date",
                        val: busDate,
                      },
                      {
                        icon: <Users className="w-3 h-3" />,
                        label: "Passengers",
                        val: `${busPassengers} pax`,
                      },
                      {
                        icon: <MapPin className="w-3 h-3" />,
                        label: "Seats",
                        val: seats.length > 0 ? seats.join(", ") : "—",
                      },
                      {
                        icon: <Ticket className="w-3 h-3" />,
                        label: "Bus",
                        val: `#${busID}`,
                      },
                    ].map((d, i) => (
                      <div key={i}>
                        <div className="flex items-center gap-1 text-muted-foreground mb-1">
                          {d.icon}
                          <span className="mono text-[9px] tracking-widest uppercase">
                            {d.label}
                          </span>
                        </div>
                        <div className="display text-sm md:text-base tracking-tight text-ink truncate">
                          {d.val}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Bottom stub — Total */}
                  <div className="mt-4 -mx-4 -mb-4 px-4 py-3 border-t-2 border-dashed border-ink/20 bg-secondary/30 flex items-end justify-between">
                    <div>
                      <div className="mono text-[9px] tracking-widest uppercase text-muted-foreground">
                        Total fare
                      </div>
                      <div className="route-num text-[9px] tracking-widest text-muted-foreground mt-0.5">
                        {totalSelected} / {max} seats
                      </div>
                    </div>
                    <div className="display text-2xl md:text-3xl text-ink leading-none">
                      ₹{busTotalPrice}
                    </div>
                  </div>
                </div>
              </article>
            </div>

            <button
              onClick={() => {
                if (seats.length === 0) {
                  alert("Please select at least one seat.")
                  return
                }
                const seatParam = seats.join(",")
                router.push(
                  `/passengers/myticket?busId=${busID}&from=${busfrom}&to=${busTo}&date=${busDate}&passengers=${busPassengers}&price=${busTotalPrice}&seats=${seatParam}`
                )
              }}
              disabled={seats.length === 0}
              className="group w-full bg-ink text-paper py-3.5 rounded-full font-medium flex items-center justify-center gap-2 hover:bg-tram hover:text-ink transition-colors duration-300 disabled:opacity-40 disabled:hover:bg-ink disabled:hover:text-paper"
            >
              Continue to payment
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>

            <p className="mono text-[9px] tracking-widest uppercase text-muted-foreground text-center">
              Powered by Razorpay · 256-bit secure
            </p>
          </div>
        </aside>
      </main>
    </div>
  )
}
