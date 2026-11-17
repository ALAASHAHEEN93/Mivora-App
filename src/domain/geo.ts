/** Straight-line distance in km between two points (haversine). Good enough for "near me". */
export function distanceKm(a: { lat: number; lng: number }, b: { lat: number; lng: number }): number {
  const R = 6371;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

/** Sorts items by distance from `from`, nearest first, and attaches the distance. */
export function sortByDistance<T>(items: T[], from: { lat: number; lng: number }, at: (item: T) => { lat: number; lng: number }) {
  return items.map((item) => ({ item, km: distanceKm(from, at(item)) })).sort((x, y) => x.km - y.km);
}
