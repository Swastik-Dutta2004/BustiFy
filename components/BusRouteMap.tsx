"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import {
  MapContainer,
  TileLayer,
  Polyline,
  Marker,
  Tooltip,
  useMap,
} from "react-leaflet"
import L from "leaflet"
import { getCoordinates } from "@/lib/coordinates"

// ── Fix default marker icons ──
// eslint-disable-next-line @typescript-eslint/no-explicit-any
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
})

const ROUTE_COLORS = [
  "#6366f1", "#f59e0b", "#10b981", "#ef4444", "#ec4899",
  "#14b8a6", "#f97316", "#8b5cf6", "#06b6d4", "#84cc16",
]

interface BusRoute {
  id: number
  busName: string
  fromCity: string
  toCity: string
  stops: string[]
}

function createColoredIcon(color: string) {
  return L.divIcon({
    className: "bg-transparent",
    html: `<div style="width:14px;height:14px;background:${color};border:2px solid white;border-radius:50%;box-shadow:0 1px 3px rgba(0,0,0,.3)"></div>`,
    iconSize: [14, 14],
    iconAnchor: [7, 7],
  })
}

function FitBounds({ routes }: { routes: BusRoute[] }) {
  const map = useMap()

  useEffect(() => {
    if (routes.length === 0) return
    const points: [number, number][] = []
    for (const route of routes) {
      for (const stop of route.stops) {
        const c = getCoordinates(stop)
        if (c) points.push([c.lat, c.lng])
      }
    }
    if (points.length > 1) {
      map.fitBounds(L.latLngBounds(points), { padding: [40, 40] })
    }
  }, [routes, map])

  return null
}

export default function BusRouteMap({ routes }: { routes: BusRoute[] }) {
  const [activeRoute, setActiveRoute] = useState<number | null>(null)

  const routePolylines = useMemo(
    () =>
      routes.map((route, i) => {
        const positions: [number, number][] = []
        for (const stop of route.stops) {
          const c = getCoordinates(stop)
          if (c) positions.push([c.lat, c.lng])
        }
        return { id: route.id, positions, color: ROUTE_COLORS[i % ROUTE_COLORS.length], busName: route.busName, fromCity: route.fromCity, toCity: route.toCity }
      }),
    [routes]
  )

  const filtered = activeRoute
    ? routePolylines.filter((r) => r.id === activeRoute)
    : routePolylines

  return (
    <div className="relative rounded-2xl overflow-hidden border border-border h-[420px] md:h-[520px] bg-card">
      <MapContainer
        center={[22.5726, 88.3639]}
        zoom={11}
        className="w-full h-full z-0"
        zoomControl={false}
        scrollWheelZoom
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <FitBounds routes={routes} />

        {filtered.map((route) => (
          <div key={route.id}>
            {route.positions.length > 1 && (
              <Polyline
                positions={route.positions}
                pathOptions={{
                  color: route.color,
                  weight: activeRoute ? 5 : 3,
                  opacity: activeRoute && activeRoute !== route.id ? 0.2 : 0.8,
                }}
              />
            )}

            {route.positions.length > 0 && (
              <>
                <Marker
                  position={route.positions[0]}
                  icon={createColoredIcon(route.color)}
                >
                  <Tooltip direction="top" offset={[0, -10]} permanent={!!activeRoute}>
                    <span className="text-xs font-medium">{route.fromCity}</span>
                  </Tooltip>
                </Marker>
                <Marker
                  position={route.positions[route.positions.length - 1]}
                  icon={createColoredIcon(route.color)}
                >
                  <Tooltip direction="top" offset={[0, -10]} permanent={!!activeRoute}>
                    <span className="text-xs font-medium">{route.toCity}</span>
                  </Tooltip>
                </Marker>
              </>
            )}
          </div>
        ))}
      </MapContainer>

      {/* Legend */}
      {routes.length > 1 && (
        <div className="absolute top-3 left-3 z-[1000] bg-paper/90 backdrop-blur rounded-xl border border-border p-3 max-h-[340px] overflow-y-auto min-w-[180px] shadow-lg">
          <div className="mono text-[9px] tracking-widest uppercase text-muted-foreground mb-2">
            Routes
          </div>
          <div className="space-y-1.5">
            {routePolylines.map((r) => (
              <button
                key={r.id}
                onClick={() =>
                  setActiveRoute(activeRoute === r.id ? null : r.id)
                }
                onMouseEnter={() => setActiveRoute(r.id)}
                onMouseLeave={() => setActiveRoute(null)}
                className={`flex items-center gap-2 w-full text-left px-2 py-1 rounded-lg transition-colors ${
                  activeRoute === r.id ? "bg-ink/10" : "hover:bg-ink/5"
                }`}
              >
                <span
                  className="w-3 h-3 rounded-full shrink-0"
                  style={{ backgroundColor: r.color }}
                />
                <div className="min-w-0">
                  <div className="text-xs font-medium text-ink truncate">
                    {r.busName}
                  </div>
                  <div className="mono text-[9px] text-muted-foreground truncate">
                    {r.fromCity} → {r.toCity}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
