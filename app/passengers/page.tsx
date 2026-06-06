"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowRight, Search as SearchIcon, MapPin, Users, ArrowUpRight, Bus, Clock, Loader2 } from "lucide-react"

interface SearchResult {
  from: string
  to: string
  passengers: number
  date: string
}

interface Bus {
  id: number
  busName: string
  type: string
  departure: string
  arrival: string
  duration: string
  seats: number
  price: number
  rating: number
  amenities: string[]
  fromCity: string
  toCity: string
}

export default function PassengersPage() {
  const [from, setFrom] = useState("")
  const [to, setTo] = useState("")
  const [date, setDate] = useState("")
  const [passengers, setPassengers] = useState(1)
  const [searchedResult, setSearchedResult] = useState<SearchResult | null>(null)
  const [error, setError] = useState("")
  const [buslist, setBuslist] = useState<Bus[]>([])
  const [allCities, setAllCities] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  useEffect(() => {
    async function fetchAllCities() {
      try {
        const res = await fetch("/api/buses/cities")
        if (!res.ok) return
        const data = await res.json()
        setAllCities(data.cities ?? [])
      } catch (err) {
        console.error("Failed to fetch cities", err)
      }
    }
    fetchAllCities()
  }, [])

  const fetchBuses = async (fromCity: string, toCity: string) => {
    const token = localStorage.getItem("token")

    setLoading(true)
    try {
      const res = await fetch(`/api/buses/search?fromCity=${fromCity}&toCity=${toCity}`, {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!res.ok) throw new Error("Failed to fetch buses")
      const data = await res.json()
      setBuslist(data.buses ?? [])
    } catch (err) {
      console.error(err)
      setBuslist([])
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = async () => {
    if (!from || !to) {
      setError("Please fill all the fields")
      return
    }
    if (from === to) {
      setError("Origin and destination cannot be the same")
      return
    }
    setError("")
    await fetchBuses(from, to)
    setSearchedResult({ from, to, passengers, date })
  }

  const filteredBuses = buslist

  const HandleBooking = (bus: Bus) => {
    if (bus.seats === 0) {
      alert("No seats are available right now.")
      return
    }
    if (passengers > bus.seats) {
      alert("Not enough seats available.")
      return
    }
    const totalPrice = bus.price * passengers
    router.push(
      `/passengers/myticket?busId=${bus.id}&from=${from}&to=${to}&date=${date}&passengers=${passengers}&price=${totalPrice}`
    )
  }

  return (
    <div className="font-sans">
      {/* ── Editorial header strip ─────────────────────────── */}
      <section className="border-b border-ink/15 bg-paper">
        <div className="mx-auto max-w-[1400px] px-5 md:px-10 pt-8 md:pt-12 pb-6 md:pb-8">
          <div className="flex items-center gap-3 mb-3">
            <span className="route-num text-xl text-tram">№ 04</span>
            <span className="mono text-[10px] tracking-[0.3em] uppercase text-muted-foreground">
              The Journey Planner
            </span>
          </div>

          <h1 className="display text-4xl md:text-5xl lg:text-6xl leading-[0.95] tracking-tight text-ink max-w-4xl">
            Tell us{" "}
            <span className="italic font-light text-muted-foreground">where</span>,{" "}
            <span className="inline-block">
              we&apos;ll find the{" "}
              <span className="relative">
                <span className="relative z-10">bus</span>
                <span className="absolute inset-x-0 bottom-1 h-3 md:h-4 bg-tram -z-0 -rotate-2" />
              </span>
              .
            </span>
          </h1>

          <p className="mt-4 max-w-2xl text-sm md:text-base text-ink/80 leading-relaxed">
            Real-time availability across 412 routes. AC, non-AC, tram, mini —
            every bus in the network, on one board.
          </p>
        </div>

        {/* Search "boarding pass" */}
        <div className="mx-auto max-w-[1400px] px-5 md:px-10 -mb-12 md:-mb-14 relative z-10">
          <div className="bg-ink text-paper rounded-2xl overflow-hidden paper-grain">
            <div className="relative z-10 p-4 md:p-6">
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-paper/15">
                <div className="flex items-center gap-3">
                  <span className="route-num text-xl text-tram">F·01</span>
                  <span className="mono text-[10px] tracking-[0.3em] uppercase opacity-60">
                    Search Parameters
                  </span>
                </div>
                <span className="stamp text-tram border-tram">Open</span>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-12 gap-2.5 md:gap-3">
                {/* From */}
                <div className="col-span-2 md:col-span-4">
                  <label className="mono text-[10px] tracking-widest uppercase opacity-60 flex items-center gap-1.5 mb-1.5">
                    <MapPin className="w-3 h-3" /> From
                  </label>
                  <input
                    type="text"
                    list="from-cities"
                    placeholder="Type city name..."
                    className="w-full bg-paper/10 border border-paper/20 focus:border-tram rounded-xl px-3 py-2.5 text-sm font-medium outline-none transition-colors"
                    value={from}
                    onChange={(e) => setFrom(e.target.value)}
                  />
                  <datalist id="from-cities">
                    {allCities.map((city) => (
                      <option key={city} value={city} />
                    ))}
                  </datalist>
                </div>

                {/* Swap icon */}
                <div className="hidden md:flex md:col-span-1 items-end justify-center pb-1.5">
                  <div className="w-8 h-8 rounded-full border border-paper/20 grid place-items-center">
                    <ArrowRight className="w-3.5 h-3.5 text-tram" />
                  </div>
                </div>

                {/* To */}
                <div className="col-span-2 md:col-span-3">
                  <label className="mono text-[10px] tracking-widest uppercase opacity-60 flex items-center gap-1.5 mb-1.5">
                    <MapPin className="w-3 h-3" /> To
                  </label>
                  <input
                    type="text"
                    list="to-cities"
                    placeholder="Type city name..."
                    className="w-full bg-paper/10 border border-paper/20 focus:border-tram rounded-xl px-3 py-2.5 text-sm font-medium outline-none transition-colors"
                    value={to}
                    onChange={(e) => setTo(e.target.value)}
                  />
                  <datalist id="to-cities">
                    {allCities.filter((city) => city !== from).map((city) => (
                      <option key={city} value={city} />
                    ))}
                  </datalist>
                </div>

                {/* Seats */}
                <div className="col-span-1 md:col-span-1">
                  <label className="mono text-[10px] tracking-widest uppercase opacity-60 flex items-center gap-1.5 mb-1.5">
                    <Users className="w-3 h-3" /> Seats
                  </label>
                  <input
                    type="number"
                    min="1"
                    className="w-full bg-paper/10 border border-paper/20 focus:border-tram rounded-xl px-3 py-2.5 text-sm font-medium outline-none transition-colors"
                    value={passengers}
                    onChange={(e) => setPassengers(Number(e.target.value))}
                  />
                </div>

                {/* CTA */}
                <div className="col-span-1 md:col-span-1 flex items-end">
                  <button
                    onClick={handleSearch}
                    disabled={loading}
                    className="w-full bg-tram text-ink rounded-xl py-2.5 font-medium hover:bg-paper transition-colors flex items-center justify-center gap-1.5 group disabled:opacity-60"
                  >
                    {loading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <SearchIcon className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {error && (
                <p className="mt-3 mono text-[10px] tracking-widest uppercase text-howrah border-l-2 border-howrah pl-3">
                  ⚠ {error}
                </p>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ── Results ────────────────────────────────────────── */}
      <section className="pt-20 md:pt-24 pb-16 px-5 md:px-10">
        <div className="mx-auto max-w-[1400px]">
          {!searchedResult ? (
            <div className="grid grid-cols-12 gap-6">
              <div className="col-span-12 md:col-span-5">
                <div className="flex items-center gap-3 mb-3">
                  <span className="route-num text-xl text-tram">§ 04.1</span>
                  <span className="mono text-[10px] tracking-[0.3em] uppercase text-muted-foreground">
                    Quick Suggestions
                  </span>
                </div>
                <h2 className="display text-3xl md:text-4xl leading-tight tracking-tight mb-3 text-ink">
                  Popular <br />
                  <span className="italic font-light text-muted-foreground">routes.</span>
                </h2>
                <p className="text-sm text-ink/70 leading-relaxed max-w-md">
                  The most-booked routes this week. Tap one to prefill the search above.
                </p>
              </div>

              <div className="col-span-12 md:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  { from: "Howrah", to: "Esplanade", rides: "8.2k", time: "35 min" },
                  { from: "Salt Lake", to: "Airport", rides: "5.1k", time: "55 min" },
                  { from: "Gariahat", to: "Dakshineswar", rides: "3.4k", time: "1h 12m" },
                  { from: "Park St", to: "Sector V", rides: "4.7k", time: "48 min" },
                ].map((r, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      setFrom(r.from)
                      setTo(r.to)
                    }}
                    className="group text-left bg-card border border-border rounded-2xl p-4 hover:border-ink hover:-translate-y-0.5 transition-all"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="mono text-[10px] tracking-widest text-muted-foreground">
                        Route · {String(i + 1).padStart(3, "0")}
                      </span>
                      <ArrowUpRight className="w-3.5 h-3.5 text-muted-foreground group-hover:text-ink group-hover:rotate-45 transition-all" />
                    </div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="display text-lg text-ink">{r.from}</span>
                      <ArrowRight className="w-3.5 h-3.5 text-tram" />
                      <span className="display text-lg text-ink">{r.to}</span>
                    </div>
                    <div className="flex items-center gap-3 mono text-[10px] tracking-widest uppercase text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {r.time}
                      </span>
                      <span>{r.rides} rides/wk</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-5">
              <div className="flex items-end justify-between flex-wrap gap-3 pb-4 border-b border-ink/20">
                <div>
                  <div className="mono text-[10px] tracking-widest uppercase text-muted-foreground mb-1.5">
                    {loading
                      ? "Searching…"
                      : `${filteredBuses.length} result${
                          filteredBuses.length !== 1 ? "s" : ""
                        } · ${searchedResult.date}`}
                  </div>
                  <h2 className="display text-2xl md:text-4xl leading-tight tracking-tight text-ink">
                    {searchedResult.from}{" "}
                    <ArrowRight className="inline w-6 h-6 text-tram mb-1" />{" "}
                    {searchedResult.to}
                  </h2>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-muted-foreground">Sort:</span>
                  <button className="text-muted-foreground hover:text-ink">Cheapest</button>
                  <span className="text-muted-foreground">·</span>
                  <button className="text-muted-foreground hover:text-ink">Fastest</button>
                </div>
              </div>

              {loading ? (
                <div className="flex items-center justify-center py-14 gap-3 text-muted-foreground">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span className="mono text-[10px] tracking-widest uppercase">
                    Fetching buses…
                  </span>
                </div>
              ) : filteredBuses.length > 0 ? (
                <div className="space-y-3">
                  {filteredBuses.map((bus) => (
                    <article
                      key={bus.id}
                      className="group relative bg-card border border-border rounded-2xl overflow-hidden hover:border-ink hover:shadow-xl transition-all"
                    >
                      <div className="grid grid-cols-12 items-stretch">
                        {/* Route code — left stub */}
                        <div className="col-span-12 md:col-span-2 bg-ink text-paper p-4 md:p-5 flex md:flex-col items-center md:items-start justify-between md:justify-center gap-3 relative">
                          <div className="route-num text-4xl md:text-5xl text-tram leading-none">
                            {String(bus.id).slice(-2).padStart(2, "0")}
                          </div>
                          <div className="md:mt-2">
                            <div className="mono text-[9px] tracking-widest opacity-60">BUS</div>
                            <div className="mono text-xs font-medium">
                              {bus.busName.slice(0, 10)}
                            </div>
                          </div>
                          <div className="hidden md:block absolute -right-1.5 top-1/2 -translate-y-1/2 w-3 h-3 bg-paper rounded-full" />
                        </div>

                        {/* Middle — info */}
                        <div className="col-span-12 md:col-span-7 p-4 md:p-5 flex flex-col md:flex-row md:items-center gap-4 md:gap-6 relative">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1.5">
                              <span className="stamp text-tram border-tram">{bus.type}</span>
                              <span className="mono text-[10px] tracking-widest text-muted-foreground">
                                ★ {bus.rating} · {bus.seats} seats left
                              </span>
                            </div>
                            <h3 className="display text-xl text-ink mb-1 leading-tight">
                              {bus.busName}
                            </h3>
                            <p className="text-xs text-muted-foreground">
                              {bus.amenities?.join(" · ") || "WiFi · Water · Charging"}
                            </p>
                          </div>

                          <div className="flex items-center gap-4 md:gap-5">
                            <div className="text-center">
                              <div className="display text-xl text-ink leading-none">
                                {bus.departure}
                              </div>
                              <div className="mono text-[9px] tracking-widest text-muted-foreground mt-1">
                                DEPART
                              </div>
                            </div>
                            <div className="flex flex-col items-center">
                              <div className="w-1.5 h-1.5 rounded-full bg-ink" />
                              <div className="w-px h-5 bg-border my-0.5" />
                              <div className="w-1.5 h-1.5 rounded-full bg-tram" />
                              <div className="mono text-[9px] tracking-widest text-muted-foreground mt-1">
                                {bus.duration || "—"}
                              </div>
                            </div>
                            <div className="text-center">
                              <div className="display text-xl text-ink leading-none">
                                {bus.arrival}
                              </div>
                              <div className="mono text-[9px] tracking-widest text-muted-foreground mt-1">
                                ARRIVE
                              </div>
                            </div>
                          </div>

                          <div className="hidden md:block absolute -right-1.5 top-1/2 -translate-y-1/2 w-3 h-3 bg-paper rounded-full" />
                        </div>

                        {/* Right stub — price + CTA */}
                        <div className="col-span-12 md:col-span-3 p-4 md:p-5 bg-secondary/40 flex md:flex-col items-center md:items-end justify-between md:justify-center gap-3 md:gap-2 border-t md:border-t-0 md:border-l border-dashed border-ink/20">
                          <div className="md:text-right">
                            <div className="mono text-[10px] tracking-widest text-muted-foreground">
                              From
                            </div>
                            <div className="display text-2xl text-ink leading-none">
                              ₹{bus.price}
                            </div>
                            <div className="mono text-[10px] tracking-widest text-muted-foreground mt-1">
                              × {searchedResult.passengers} pax
                            </div>
                          </div>
                          <button
                            onClick={() => HandleBooking(bus)}
                            className="bg-ink text-paper px-4 py-2 rounded-full text-xs font-medium hover:bg-tram hover:text-ink transition-colors flex items-center gap-1.5 group/btn"
                          >
                            Book
                            <ArrowUpRight className="w-3 h-3 group-hover/btn:rotate-45 transition-transform" />
                          </button>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              ) : (
                <div className="border-2 border-dashed border-border rounded-3xl p-12 text-center">
                  <Bus className="w-10 h-10 mx-auto text-muted-foreground/30 mb-3" />
                  <h3 className="display text-xl text-ink mb-1.5">No buses on this route.</h3>
                  <p className="text-muted-foreground text-sm">
                    Try a different date or check our{" "}
                    <button
                      onClick={() => setSearchedResult(null)}
                      className="text-ink underline decoration-tram decoration-2 underline-offset-4"
                    >
                      popular routes
                    </button>
                    .
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
