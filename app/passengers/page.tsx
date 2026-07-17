"use client"

import { useEffect, useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { ArrowRight, Search as SearchIcon, MapPin, Users, ArrowUpRight, Bus, Clock, Loader2, Ticket, MapIcon, ChevronDown, X, Lock } from "lucide-react"
import { useAuth } from "@/components/AuthProvider"
import "leaflet/dist/leaflet.css"
import dynamic from "next/dynamic"

const BusRouteMap = dynamic(() => import("@/components/BusRouteMap"), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-[420px] bg-card rounded-2xl border border-border">
      <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
    </div>
  ),
})

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
  stops: string[]
}

// A stop/city option, as returned by /api/buses/cities.
// routeCount is optional so the UI still works if the API hasn't been
// updated yet to return counts (falls back to hiding the count badge).
interface CityOption {
  name: string
  routeCount?: number
}

export default function PassengersPage() {
  const { isAuthenticated } = useAuth()
  const [from, setFrom] = useState("")
  const [to, setTo] = useState("")
  const [date, setDate] = useState("")
  const [passengers, setPassengers] = useState(1)
  const [searchedResult, setSearchedResult] = useState<SearchResult | null>(null)
  const [error, setError] = useState("")
  const [buslist, setBuslist] = useState<Bus[]>([])
  const [allCities, setAllCities] = useState<CityOption[]>([])
  const [citiesError, setCitiesError] = useState("")
  const [loading, setLoading] = useState(false)
  const [openDropdown, setOpenDropdown] = useState<"from" | "to" | null>(null)
  const [filterText, setFilterText] = useState("")
  const [showLoginPrompt, setShowLoginPrompt] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  useEffect(() => {
    async function fetchAllCities() {
      try {
        const token = localStorage.getItem("token")
        const res = await fetch("/api/buses/cities", {
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        })

        if (!res.ok) {
          // Log the actual failure instead of silently returning — a 401
          // here (missing/expired token) is the most common reason the
          // dropdown ends up empty with no visible error anywhere.
          const body = await res.text().catch(() => "")
          console.error(`Failed to fetch cities: ${res.status} ${res.statusText}`, body)
          setCitiesError(`Could not load stops (${res.status})`)
          return
        }

        const data = await res.json()
        const raw = data.cities ?? data.stops ?? data.data ?? []

        if (!Array.isArray(raw)) {
          console.error("Unexpected /api/buses/cities response shape:", data)
          setCitiesError("Unexpected response from server")
          return
        }

        // Normalize: API may return string[] (legacy), or objects using
        // any of a few common key names, or { name, routeCount }[] once
        // the backend is updated to include counts.
        const normalized: CityOption[] = raw
          .map((c: any) => {
            if (typeof c === "string") return { name: c }
            const name = c.name ?? c.city ?? c.cityName ?? c.stopName ?? c.stop
            if (!name) return null
            const routeCount = c.routeCount ?? c.routes ?? c.count
            return { name, routeCount: typeof routeCount === "number" ? routeCount : undefined }
          })
          .filter((c: CityOption | null): c is CityOption => c !== null)

        if (normalized.length === 0 && raw.length > 0) {
          console.error("Received cities but couldn't read names from them. Raw sample:", raw[0])
        }

        setCitiesError("")
        setAllCities(normalized)
      } catch (err) {
        console.error("Failed to fetch cities", err)
        setCitiesError("Could not load stops")
      }
    }
    fetchAllCities()
  }, [])

  useEffect(() => {
    function handleInteraction(e: MouseEvent | KeyboardEvent) {
      if (e instanceof KeyboardEvent && e.key !== "Escape") return
      if (e instanceof MouseEvent && dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpenDropdown(null)
        setFilterText("")
        return
      }
      if (e instanceof KeyboardEvent && e.key === "Escape") {
        setOpenDropdown(null)
        setFilterText("")
      }
    }
    document.addEventListener("mousedown", handleInteraction)
    document.addEventListener("keydown", handleInteraction)
    return () => {
      document.removeEventListener("mousedown", handleInteraction)
      document.removeEventListener("keydown", handleInteraction)
    }
  }, [])

  const fetchBuses = async (fromCity: string, toCity: string) => {
    const token = localStorage.getItem("token")

    if (!token) {
      setError("You need to log in first.")
      setBuslist([])
      setLoading(false)
      return
    }

    setLoading(true)
    try {
      const res = await fetch(`/api/buses/search?fromCity=${fromCity}&toCity=${toCity}`, {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!res.ok) {
        const errBody = await res.json().catch(() => ({}))
        const message = errBody.error || "Failed to fetch buses"
        if (message.toLowerCase().includes("invalid token") || message.toLowerCase().includes("no token")) {
          localStorage.removeItem("token")
          router.push("/login")
          return
        }
        throw new Error(message);
      }
      const data = await res.json()
      const rawBuses: any[] = data.validBuses ?? data.buses ?? []
      const mapped = rawBuses.map((b: any) => ({
        id: b.id,
        busName: b.busName,
        type: b.type || "Standard",
        departure: b.departureTime || "",
        arrival: b.arrivalTime || "",
        duration: (() => {
          if (!b.departureTime || !b.arrivalTime) return ""
          const [dh, dm] = b.departureTime.split(":").map(Number)
          const [ah, am] = b.arrivalTime.split(":").map(Number)
          let diff = (ah * 60 + am) - (dh * 60 + dm)
          if (diff < 0) diff += 1440
          return `${Math.floor(diff / 60)}h ${diff % 60}m`
        })(),
        seats: b.totalSeats ?? b.seats ?? 0,
        price: b.price,
        rating: b.rating ?? 4.0,
        amenities: b.amenities ?? [],
        fromCity: b.fromCity,
        toCity: b.toCity,
        stops: b.stops ?? [],
      }))
      setBuslist(mapped)
    } catch (err) {
      console.error(err)
      setError(err instanceof Error ? err.message : "Failed to fetch buses")
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

  const [selectedBusForPayment, setSelectedBusForPayment] = useState<Bus | null>(null)

  const handleGenerateTicket = () => {
    if (!searchedResult) return
    if (!isAuthenticated) {
      setShowLoginPrompt(true)
      return
    }
    const bus = selectedBusForPayment
    const query = new URLSearchParams({
      from: searchedResult.from,
      to: searchedResult.to,
    })
    if (bus) {
      query.set("bus", bus.busName)
      query.set("departure", bus.departure)
      query.set("arrival", bus.arrival)
      query.set("duration", bus.duration)
    }
    router.push(`/passengers/payment?${query.toString()}`)
  }

  const renderStopDropdown = (field: "from" | "to") => {
    const excluded = field === "from" ? to : from
    const options = allCities
      .filter((c) => c.name !== excluded)
      .filter((c) => c.name.toLowerCase().includes(filterText.toLowerCase()))

    const popularStops = options.filter((c) => typeof c.routeCount === "number" && c.routeCount >= 3)
    const otherStops = options.filter((c) => !popularStops.includes(c))

    return (
      <div className="absolute top-full left-0 right-0 mt-2 bg-ink text-paper rounded-2xl shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
        {/* Search input */}
        <div className="p-3 border-b border-paper/10">
          <div className="relative">
            <SearchIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-paper/40" />
            <input
              type="text"
              placeholder="Search any stop…"
              className="w-full bg-paper/8 border border-paper/15 focus:border-tram rounded-xl pl-10 pr-4 py-2.5 text-sm text-paper outline-none placeholder:text-paper/30 transition-colors"
              value={filterText}
              onChange={(e) => setFilterText(e.target.value)}
              autoFocus
            />
          </div>
        </div>

        {/* Stop list */}
        <div className="overflow-y-auto max-h-80 no-scrollbar">
          {citiesError && (
            <div className="px-4 py-6 text-center">
              <div className="text-paper/40 mono text-[10px] tracking-[0.2em] uppercase">
                {citiesError}
              </div>
            </div>
          )}

          {!citiesError && popularStops.length > 0 && !filterText && (
            <div>
              <div className="px-4 pt-3 pb-1.5">
                <span className="mono text-[9px] tracking-[0.25em] uppercase text-tram">
                  Popular Stops
                </span>
              </div>
              {popularStops.map((city) => (
                <button
                  key={city.name}
                  type="button"
                  onClick={() => {
                    if (field === "from") setFrom(city.name)
                    else setTo(city.name)
                    setOpenDropdown(null)
                    setFilterText("")
                  }}
                  className="w-full text-left px-4 py-3 hover:bg-paper/8 transition-colors flex items-center justify-between group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-tram shrink-0" />
                    <span className="text-[14px] font-medium text-paper group-hover:text-tram transition-colors">
                      {city.name}
                    </span>
                  </div>
                  {typeof city.routeCount === "number" && (
                    <span className="mono text-[10px] tracking-wide text-paper/40 whitespace-nowrap border border-paper/15 rounded-full px-2 py-0.5">
                      {city.routeCount} routes
                    </span>
                  )}
                </button>
              ))}
              {otherStops.length > 0 && (
                <div className="mx-4 border-b border-paper/8" />
              )}
            </div>
          )}

          {!citiesError && otherStops.length > 0 && (
            <div>
              {popularStops.length > 0 && !filterText && (
                <div className="px-4 pt-3 pb-1.5">
                  <span className="mono text-[9px] tracking-[0.25em] uppercase text-paper/30">
                    All Stops
                  </span>
                </div>
              )}
              {(filterText ? options : otherStops).map((city) => (
                <button
                  key={city.name}
                  type="button"
                  onClick={() => {
                    if (field === "from") setFrom(city.name)
                    else setTo(city.name)
                    setOpenDropdown(null)
                    setFilterText("")
                  }}
                  className="w-full text-left px-4 py-3 hover:bg-paper/8 transition-colors flex items-center justify-between group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-paper/20 group-hover:bg-tram shrink-0 transition-colors" />
                    <span className="text-[14px] text-paper/70 group-hover:text-paper transition-colors">
                      {city.name}
                    </span>
                  </div>
                  {typeof city.routeCount === "number" && (
                    <span className="mono text-[10px] tracking-wide text-paper/25 whitespace-nowrap">
                      {city.routeCount}
                    </span>
                  )}
                </button>
              ))}
            </div>
          )}

          {!citiesError && options.length === 0 && (
            <div className="px-4 py-8 text-center">
              <div className="text-paper/20 mono text-[10px] tracking-[0.25em] uppercase">
                {allCities.length === 0 ? "No stops loaded yet" : `No stops match "${filterText}"`}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-2.5 border-t border-paper/10 flex items-center justify-between">
          <span className="mono text-[9px] tracking-wide text-paper/25">
            {options.length} stop{options.length !== 1 ? "s" : ""} available
          </span>
          <span className="mono text-[9px] tracking-wide text-paper/25">
            esc to close
          </span>
        </div>
      </div>
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
          {/*
            NOTE: outer card no longer has overflow-hidden — that was
            clipping the absolutely-positioned dropdown into the card,
            making it look "merged" into the search box instead of
            floating over the page. The paper-grain texture still gets
            clipped to the rounded corners via the separate inset layer
            below, so the visual look is unchanged.
          */}
          <div className="bg-ink text-paper rounded-2xl relative">
            <div className="absolute inset-0 rounded-2xl overflow-hidden paper-grain pointer-events-none" />
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

              <div ref={dropdownRef} className="grid grid-cols-2 md:grid-cols-12 gap-2.5 md:gap-3">
                {/* From */}
                <div className="col-span-2 md:col-span-4 relative">
                  <label className="mono text-[10px] tracking-widest uppercase opacity-60 flex items-center gap-1.5 mb-1.5">
                    <MapPin className="w-3 h-3" /> From — Starting Stand
                  </label>
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => {
                        setOpenDropdown(openDropdown === "from" ? null : "from")
                        setFilterText("")
                      }}
                      className="w-full bg-paper/10 border border-paper/20 focus:border-tram rounded-xl px-3 py-2.5 text-sm font-medium outline-none transition-colors text-left flex items-center justify-between"
                    >
                      <span className={from ? "text-paper" : "text-paper/40"}>
                        {from || "Select stop..."}
                      </span>
                      <ChevronDown className={`w-4 h-4 text-paper/50 transition-transform ${openDropdown === "from" ? "rotate-180" : ""}`} />
                    </button>
                    {openDropdown === "from" && renderStopDropdown("from")}
                  </div>
                </div>

                {/* Swap icon */}
                <div className="hidden md:flex md:col-span-1 items-end justify-center pb-1.5">
                  <button
                    type="button"
                    onClick={() => { const temp = from; setFrom(to); setTo(temp) }}
                    className="w-8 h-8 rounded-full border border-paper/20 grid place-items-center hover:bg-paper/10 transition-colors"
                  >
                    <ArrowRight className="w-3.5 h-3.5 text-tram" />
                  </button>
                </div>

                {/* To */}
                <div className="col-span-2 md:col-span-3 relative">
                  <label className="mono text-[10px] tracking-widest uppercase opacity-60 flex items-center gap-1.5 mb-1.5">
                    <MapPin className="w-3 h-3" /> To
                  </label>
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => {
                        setOpenDropdown(openDropdown === "to" ? null : "to")
                        setFilterText("")
                      }}
                      className="w-full bg-paper/10 border border-paper/20 focus:border-tram rounded-xl px-3 py-2.5 text-sm font-medium outline-none transition-colors text-left flex items-center justify-between"
                    >
                      <span className={to ? "text-paper" : "text-paper/40"}>
                        {to || "Select stop..."}
                      </span>
                      <ChevronDown className={`w-4 h-4 text-paper/50 transition-transform ${openDropdown === "to" ? "rotate-180" : ""}`} />
                    </button>
                    {openDropdown === "to" && renderStopDropdown("to")}
                  </div>
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
                      : `${filteredBuses.length} result${filteredBuses.length !== 1 ? "s" : ""
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
                <>
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Bus Cards */}
                    <div className="lg:col-span-2 space-y-3">
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

                            {/* Right stub — price + select */}
                            <div className="col-span-12 md:col-span-3 p-4 md:p-5 bg-secondary/40 flex md:flex-col items-center md:items-end justify-between md:justify-center gap-3 md:gap-2 border-t md:border-t-0 md:border-l border-dashed border-ink/20">
                              <div className="md:text-right">
                                <div className="mono text-[10px] tracking-widest text-muted-foreground">
                                  Fare from
                                </div>
                                <div className="display text-2xl text-ink leading-none">
                                  ₹{bus.price}
                                </div>
                                <div className="mono text-[10px] tracking-widest text-muted-foreground mt-1">
                                  Route bus
                                </div>
                              </div>
                              <button
                                onClick={() => setSelectedBusForPayment(bus)}
                                className={`w-full md:w-auto mt-2 px-4 py-2 rounded-xl text-xs font-medium transition-all ${
                                  selectedBusForPayment?.id === bus.id
                                    ? "bg-tram text-ink"
                                    : "bg-ink text-paper hover:bg-tram hover:text-ink"
                                }`}
                              >
                                {selectedBusForPayment?.id === bus.id ? "Selected" : "Select"}
                              </button>
                            </div>
                          </div>
                        </article>
                      ))}
                    </div>

                    {/* Map */}
                    <div className="lg:col-span-1 lg:sticky lg:top-6 lg:self-start">
                      <div className="flex items-center gap-2 mb-3">
                        <MapIcon className="w-4 h-4 text-tram" />
                        <span className="mono text-[10px] tracking-widest uppercase text-muted-foreground">
                          Route Map
                        </span>
                      </div>
                      <BusRouteMap
                        routes={filteredBuses.map((b) => ({
                          id: b.id,
                          busName: b.busName,
                          fromCity: b.fromCity,
                          toCity: b.toCity,
                          stops: b.stops ?? [b.fromCity, b.toCity],
                        }))}
                      />
                    </div>
                  </div>

                  {/* Generate Ticket */}
                  <div className="flex justify-center pt-6 pb-2">
                    <button
                      onClick={handleGenerateTicket}
                      disabled={!selectedBusForPayment}
                      className="group relative bg-ink text-paper px-8 py-4 rounded-full font-medium hover:bg-tram hover:text-ink transition-all duration-300 flex items-center gap-3 text-base shadow-lg hover:shadow-tram/25 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-ink disabled:hover:text-paper"
                    >
                      <Ticket className="w-5 h-5" />
                      <span>{selectedBusForPayment ? `Pay for ${selectedBusForPayment.busName}` : "Select a bus first"}</span>
                      <ArrowUpRight className="w-4 h-4 group-hover:rotate-45 transition-transform" />
                    </button>
                  </div>
                </>
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

      {/* Login Required Prompt */}
      {showLoginPrompt && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-ink/40 backdrop-blur-sm px-5">
          <div className="bg-card rounded-3xl shadow-2xl border border-ink/15 max-w-md w-full p-7 text-center relative">
            <button
              onClick={() => setShowLoginPrompt(false)}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-secondary grid place-items-center text-muted-foreground hover:text-ink transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="w-14 h-14 mx-auto rounded-2xl bg-ink text-paper grid place-items-center mb-5">
              <Lock className="w-6 h-6" />
            </div>

            <h3 className="display text-xl text-ink mb-2">Please log in to continue</h3>
            <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
              You need an account to book tickets. Your search results and selected bus will be waiting for you after login.
            </p>

            <div className="flex flex-col sm:flex-row gap-3">
              <a
                href={`/login?from=${encodeURIComponent("/passengers" + (searchedResult ? `?from=${searchedResult.from}&to=${searchedResult.to}` : ""))}`}
                className="flex-1 bg-ink text-paper py-3 rounded-full font-medium text-sm flex items-center justify-center gap-2 hover:bg-tram hover:text-ink transition-all duration-300"
              >
                Log in
                <ArrowRight className="w-4 h-4" />
              </a>
              <a
                href={`/signup?from=${encodeURIComponent("/passengers" + (searchedResult ? `?from=${searchedResult.from}&to=${searchedResult.to}` : ""))}`}
                className="flex-1 border border-ink/20 text-ink py-3 rounded-full font-medium text-sm flex items-center justify-center gap-2 hover:border-ink hover:bg-ink hover:text-paper transition-all duration-300"
              >
                Create account
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}