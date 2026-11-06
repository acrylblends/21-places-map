/** The atlas service: places, filters, collections, add, note edit, visit state and the GeoJSON export. */
import { cleanCategory, cleanCollection, cleanKind, cleanLat, cleanLng, cleanName, cleanNote, collectionsOf, filterPlaces, type AtlasState, AtlasError, type Category, type Place, type PlaceFilter, toGeoJson } from './domain.ts'
import { seed } from './seed.ts'
import type { Store } from './store.ts'

export interface AtlasAdapters { readonly store: Store<AtlasState>; readonly clock: () => Date; readonly newId: (kind: string) => string }
export interface NewPlaceInput { readonly name: unknown; readonly category: unknown; readonly kind: unknown; readonly note: unknown; readonly lat: unknown; readonly lng: unknown; readonly collection?: unknown }

export class Atlas {
  private state: AtlasState
  private readonly adapters: AtlasAdapters
  private constructor(state: AtlasState, adapters: AtlasAdapters) { this.state = state; this.adapters = adapters }
  static async open(adapters: AtlasAdapters): Promise<Atlas> { const saved = await adapters.store.load(); return new Atlas(saved ?? seed(adapters.clock(), adapters.newId), adapters) }
  get now(): Date { return this.adapters.clock() }
  places(filter: PlaceFilter = {}): Place[] { return filterPlaces(this.state.places, filter) }
  place(id: string): Place | undefined { return this.state.places.find((place) => place.id === id) }
  categories(): { category: Category; count: number }[] { return (['Food', 'Culture', 'Nature', 'Work'] as Category[]).map((category) => ({ category, count: this.state.places.filter((place) => place.category === category).length })) }
  collections(): { name: string; count: number }[] { return collectionsOf(this.state.places) }
  geoJson(): unknown { return toGeoJson(this.state.places) }
  async add(input: NewPlaceInput): Promise<Place> {
    const place: Place = {
      id: this.adapters.newId('place'),
      name: cleanName(input.name),
      category: cleanCategory(input.category),
      kind: cleanKind(input.kind),
      note: cleanNote(input.note),
      lat: cleanLat(input.lat),
      lng: cleanLng(input.lng),
      x: Math.min(92, Math.max(8, Math.round(((cleanLng(input.lng) - 16.30) / 0.12) * 100))),
      y: Math.min(86, Math.max(14, Math.round((1 - (cleanLat(input.lat) - 48.15) / 0.09) * 100))),
      addedAt: this.adapters.clock().toISOString(),
      collection: cleanCollection(input.collection),
      visited: false,
    }
    return this.commit(() => { this.state.places.push(place); return place })
  }
  async updateNote(id: string, note: unknown): Promise<Place> {
    const place = this.place(id)
    if (place === undefined) throw new AtlasError('not-found', 'That place no longer exists.')
    const next = { ...place, note: cleanNote(note) }
    return this.commit(() => { this.state.places = this.state.places.map((item) => (item.id === id ? next : item)); return next })
  }
  async toggleVisited(id: string): Promise<Place> {
    const place = this.place(id)
    if (place === undefined) throw new AtlasError('not-found', 'That place no longer exists.')
    const next = { ...place, visited: !place.visited }
    return this.commit(() => { this.state.places = this.state.places.map((item) => (item.id === id ? next : item)); return next })
  }
  private async commit<T>(change: () => T): Promise<T> {
    const snapshot = structuredClone(this.state)
    const result = change()
    try { await this.save() } catch (error) { this.state = snapshot; throw error }
    return result
  }
  private async save(): Promise<void> {
    this.state = { ...this.state, places: [...this.state.places] }
    try { await this.adapters.store.save(this.state) } catch (error) { throw new AtlasError('storage', `The atlas could not be saved: ${(error as Error).message}`) }
  }
}
