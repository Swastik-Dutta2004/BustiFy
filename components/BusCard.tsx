import Link from "next/link"
import { ArrowUpRight, MapPin } from "lucide-react"

interface Bus {
  id: number
  name: string
  type: string
  departure: string
  arrival: string
  price: number
  seats: number
  rating: number
}

export default function BusCard({ bus, from, to }: { bus: Bus; from: string; to: string }) {
  return (
    <article className="group relative bg-card border border-border rounded-2xl overflow-hidden hover:border-ink hover:shadow-xl transition-all">
      <div className="grid grid-cols-12 items-stretch">
        <div className="col-span-3 md:col-span-2 bg-ink text-paper p-5 flex flex-col items-center justify-center relative">
          <div className="route-num text-4xl md:text-5xl text-tram leading-none">
            {String(bus.id).slice(-2).padStart(2, "0")}
          </div>
          <div className="mono text-[9px] tracking-widest opacity-60 mt-1.5">BUS</div>
          <div className="hidden md:block absolute -right-1.5 top-1/2 -translate-y-1/2 w-3 h-3 bg-card rounded-full" />
        </div>

        <div className="col-span-9 md:col-span-7 p-5 md:p-6 flex flex-col md:flex-row md:items-center gap-4 md:gap-8 relative">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1.5">
              <span className="stamp text-tram border-tram">{bus.type}</span>
              <span className="mono text-[10px] tracking-widest text-muted-foreground">
                ★ {bus.rating}
              </span>
            </div>
            <h2 className="display text-xl md:text-2xl text-ink leading-tight mb-1.5">{bus.name}</h2>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <MapPin className="w-3 h-3 text-tram" />
              {from} <span className="opacity-50">→</span> {to}
            </div>
          </div>

          <div className="flex items-center gap-5">
            <div className="text-center">
              <div className="display text-xl text-ink leading-none">{bus.departure}</div>
              <div className="mono text-[9px] tracking-widest text-muted-foreground mt-1">DEPART</div>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-1.5 h-1.5 rounded-full bg-ink" />
              <div className="w-px h-5 bg-border my-0.5" />
              <div className="w-1.5 h-1.5 rounded-full bg-tram" />
            </div>
            <div className="text-center">
              <div className="display text-xl text-ink leading-none">{bus.arrival}</div>
              <div className="mono text-[9px] tracking-widest text-muted-foreground mt-1">ARRIVE</div>
            </div>
          </div>

          <div className="hidden md:block absolute -right-1.5 top-1/2 -translate-y-1/2 w-3 h-3 bg-card rounded-full" />
        </div>

        <div className="col-span-12 md:col-span-3 p-5 md:p-6 bg-secondary/40 flex md:flex-col items-center md:items-end justify-between md:justify-center gap-3 border-t md:border-t-0 md:border-l border-dashed border-ink/20">
          <div className="md:text-right">
            <div className="mono text-[10px] tracking-widest text-muted-foreground">From</div>
            <div className="display text-2xl text-ink leading-none">₹{bus.price}</div>
            <div className="mono text-[10px] tracking-widest text-muted-foreground mt-1">
              {bus.seats} seats left
            </div>
          </div>
          <Link
            href={`/passengers/ticket?from=${from}&to=${to}`}
            className="bg-ink text-paper px-4 py-2 rounded-full text-sm font-medium hover:bg-tram hover:text-ink transition-colors flex items-center gap-1.5"
          >
            Book
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </article>
  )
}
