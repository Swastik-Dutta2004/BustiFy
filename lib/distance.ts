import { getCoordinates } from "./coordinates"

export function haversine(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLon = ((lon2 - lon1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

export function calculateRouteDistance(stopNames: string[]): number {
  const coords = stopNames
    .map((name) => getCoordinates(name))
    .filter((c): c is { lat: number; lng: number } => c !== null)

  if (coords.length < 2) return 0

  let total = 0
  for (let i = 0; i < coords.length - 1; i++) {
    total += haversine(
      coords[i].lat,
      coords[i].lng,
      coords[i + 1].lat,
      coords[i + 1].lng
    )
  }
  return Math.round(total * 10) / 10
}
