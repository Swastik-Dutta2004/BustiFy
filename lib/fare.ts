const BASE_FARE = 10
const PRICE_PER_KM = 2

export function calculateFare(distanceKm: number): number {
  if (distanceKm <= 0) return BASE_FARE
  return Math.ceil(BASE_FARE + distanceKm * PRICE_PER_KM)
}
