/** Places Map's types and pure rules: places, categories, collections, search and the GeoJSON export. */
export type Category = 'Food' | 'Culture' | 'Nature' | 'Work'
export const CATEGORIES: readonly Category[] = ['Food', 'Culture', 'Nature', 'Work']
export const CATEGORY_COLORS: Readonly<Record<Category, string>> = { Food: '#d18142', Culture: '#487fbc', Nature: '#4b9869', Work: '#8c72bb' }

export interface Place {
  readonly id: string
  readonly name: string
  readonly category: Category
  readonly kind: string
  readonly note: string
  readonly lat: number
  readonly lng: number
  /** Position on the illustrative vector map, percent of width and height. */
  readonly x: number
  readonly y: number
  readonly addedAt: string
  readonly collection: string
  readonly visited: boolean
}

export interface AtlasState {
  readonly version: 1
  places: Place[]
}

export type AtlasErrorCode = 'invalid' | 'not-found' | 'storage'
export class AtlasError extends Error {
  readonly code: AtlasErrorCode
  constructor(code: AtlasErrorCode, message: string) {
    super(message)
    this.code = code
    this.name = 'AtlasError'
  }
}

export function dateLabel(stamp: string): string {
  const date = new Date(stamp)
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  return `${String(date.getUTCDate())} ${months[date.getUTCMonth()] ?? ''} ${String(date.getUTCFullYear())}`
}

export function whenText(stamp: string, now: Date): string {
  const days = Math.floor((now.getTime() - new Date(stamp).getTime()) / 86_400_000)
  if (days <= 0) return 'Today'
  if (days === 1) return 'Yesterday'
  if (days < 30) return `${String(days)} days ago`
  return dateLabel(stamp)
}

export interface PlaceFilter {
  readonly category?: Category
  readonly q?: string
  readonly collection?: string
}

export function filterPlaces(places: readonly Place[], filter: PlaceFilter = {}): Place[] {
  const q = (filter.q ?? '').trim().toLowerCase()
  return [...places]
    .filter((place) => filter.category === undefined || place.category === filter.category)
    .filter((place) => filter.collection === undefined || place.collection === filter.collection)
    .filter((place) => q === '' || [place.name, place.kind, place.note, place.category].join(' ').toLowerCase().includes(q))
    .sort((a, b) => b.addedAt.localeCompare(a.addedAt))
}

export function collectionsOf(places: readonly Place[]): { name: string; count: number }[] {
  const counts = new Map<string, number>()
  for (const place of places) if (place.collection !== '') counts.set(place.collection, (counts.get(place.collection) ?? 0) + 1)
  return [...counts.entries()].map(([name, count]) => ({ name, count })).sort((a, b) => a.name.localeCompare(b.name))
}

export function cleanName(value: unknown): string {
  if (typeof value !== 'string' || value.trim() === '') throw new AtlasError('invalid', 'The place name is required.')
  return value.trim().slice(0, 80)
}

export function cleanNote(value: unknown): string {
  if (typeof value !== 'string' || value.trim() === '') throw new AtlasError('invalid', 'A note is required.')
  return value.trim().slice(0, 500)
}

export function cleanKind(value: unknown): string {
  if (typeof value !== 'string' || value.trim() === '') throw new AtlasError('invalid', 'A kind is required.')
  return value.trim().slice(0, 40)
}

export function cleanCategory(value: unknown): Category {
  return CATEGORIES.includes(value as Category) ? (value as Category) : 'Culture'
}

export function cleanLat(value: unknown): number {
  const number = Number(value)
  if (!Number.isFinite(number) || number < -90 || number > 90) throw new AtlasError('invalid', 'Latitude must be between -90 and 90.')
  return Math.round(number * 10_000) / 10_000
}

export function cleanLng(value: unknown): number {
  const number = Number(value)
  if (!Number.isFinite(number) || number < -180 || number > 180) throw new AtlasError('invalid', 'Longitude must be between -180 and 180.')
  return Math.round(number * 10_000) / 10_000
}

export function cleanCollection(value: unknown): string {
  return typeof value === 'string' ? value.trim().slice(0, 60) : ''
}

export function toGeoJson(places: readonly Place[]): { type: 'FeatureCollection'; features: unknown[] } {
  return {
    type: 'FeatureCollection',
    features: places.map((place) => ({
      type: 'Feature',
      geometry: { type: 'Point', coordinates: [place.lng, place.lat] },
      properties: { name: place.name, category: place.category, kind: place.kind, note: place.note, collection: place.collection, visited: place.visited },
    })),
  }
}
