import assert from 'node:assert/strict'
import { test } from 'node:test'
import { Atlas, AtlasError, categoryColorOf, cleanLat, cleanLng, filterPlaces, toGeoJson, type AtlasState } from '../plugins/atlas/index.ts'
import { seed } from '../plugins/atlas/seed.ts'
import { memoryStore } from '../plugins/atlas/store.ts'
import { NOW } from './support.ts'

const ids = (): ((kind: string) => string) => { let next = 0; return (kind) => `${kind}-${String(++next)}` }

test('the seed is the Vienna collection: eight places across the four categories', () => {
  const state = seed(NOW, ids())
  assert.equal(state.places.length, 8)
  assert.equal(state.places.filter((place) => place.category === 'Food').length, 2)
  assert.equal(state.places.filter((place) => place.category === 'Culture').length, 3)
  assert.equal(state.places.filter((place) => place.category === 'Nature').length, 2)
  assert.equal(state.places.filter((place) => place.category === 'Work').length, 1)
  assert.equal(state.places[0]?.name, 'MuseumsQuartier')
  assert.equal(state.places.every((place) => place.collection === 'Vienna weekend'), true)
})

test('filters narrow by category, search and collection', () => {
  const state = seed(NOW, ids())
  assert.ok(filterPlaces(state.places, { category: 'Food' }).every((place) => place.category === 'Food'))
  assert.equal(filterPlaces(state.places, { q: 'jelinek' })[0]?.name, 'Café Jelinek')
  assert.equal(filterPlaces(state.places, { q: 'nothing-matches' }).length, 0)
  assert.equal(filterPlaces(state.places, { collection: 'Vienna weekend' }).length, 8)
})

test('coordinates and text are validated', () => {
  assert.equal(cleanLat('48.2029'), 48.2029)
  assert.throws(() => cleanLat('91'), /Latitude/)
  assert.equal(cleanLng('16.3581'), 16.3581)
  assert.throws(() => cleanLng('181'), /Longitude/)
})

test('adding a place, editing a note and toggling visited persist', async () => {
  const store = memoryStore<AtlasState>()
  const atlas = await Atlas.open({ store, clock: () => NOW, newId: ids() })
  const place = await atlas.add({ name: 'New stop', category: 'Food', kind: 'Bakery', note: 'Good bread.', lat: 48.2, lng: 16.36, collection: 'Vienna weekend' })
  assert.equal(atlas.places().length, 9)
  assert.equal(place.visited, false)
  const noted = await atlas.updateNote(place.id, 'Better before noon.')
  assert.equal(noted.note, 'Better before noon.')
  const visited = await atlas.toggleVisited(place.id)
  assert.equal(visited.visited, true)
  await assert.rejects(atlas.updateNote('missing', 'x'), (error: unknown) => error instanceof AtlasError && error.code === 'not-found')
  assert.equal(store.saved, 3)
})

test('the GeoJSON export is a feature collection of points', () => {
  const geo = toGeoJson(seed(NOW, ids()).places) as { type: string; features: { geometry: { coordinates: number[] } }[] }
  assert.equal(geo.type, 'FeatureCollection')
  assert.equal(geo.features.length, 8)
  assert.deepEqual(geo.features[0]?.geometry.coordinates, [16.3581, 48.2029])
  assert.equal(categoryColorOf('Food'), '#d18142')
})

test('a failed save is a storage error', async () => {
  const broken = await Atlas.open({ store: { load: async () => undefined, save: async () => { throw new Error('disk full') } }, clock: () => NOW, newId: ids() })
  const place = broken.places()[0]
  assert.ok(place !== undefined)
  await assert.rejects(broken.toggleVisited(place.id), (error: unknown) => error instanceof AtlasError && error.code === 'storage')
  assert.equal(broken.place(place.id)?.visited, place.visited)
})
