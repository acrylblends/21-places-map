import assert from 'node:assert/strict'
import { mkdirSync } from 'node:fs'
import { mkdtemp, rm } from 'node:fs/promises'
import { join } from 'node:path'
import { test } from 'node:test'
import { createApp, readManifest } from '../src/app.ts'
import type { AtlasState } from '../plugins/atlas/domain.ts'
import { pinnedInstance } from '../plugins/instance/index.ts'
import { noticeOf, NOW, projectRoot, withApp } from './support.ts'
const scratch = join(projectRoot, '.acrylblends', 'test')
mkdirSync(scratch, { recursive: true })

test('the first page is the mockup map workspace: bar, saved places, markers, legend and detail', () =>
  withApp(async (app) => {
    const page = await app.page('/')
    assert.equal(page.status, 200)
    assert.match(page.html, /Field Atlas/)
    assert.match(page.html, /Search places, tags, notes/)
    assert.match(page.html, /Export/)
    assert.match(page.html, /Add place/)
    assert.match(page.html, /Saved places <span class="tiny">08<\/span>/)
    assert.match(page.html, /All places/)
    assert.match(page.html, /Food/)
    assert.match(page.html, /Culture/)
    assert.match(page.html, /Nature/)
    assert.match(page.html, /Work/)
    assert.equal((page.html.match(/class="place/g) ?? []).length, 8)
    assert.equal((page.html.match(/class="pin"/g) ?? []).length, 8)
    assert.match(page.html, /MuseumsQuartier/)
    assert.match(page.html, /48\.2029, 16\.3581/)
    assert.match(page.html, /Vienna weekend/)
    assert.match(page.html, /maplegend/)
  }))

test('category, search and selection change the list and the detail, and an unmatched filter is empty', () =>
  withApp(async (app) => {
    const food = await app.page('/?category=Food')
    assert.equal((food.html.match(/class="place/g) ?? []).length, 2)
    assert.doesNotMatch(food.html, /Stadtpark/)
    const search = await app.page('/?q=jelinek')
    assert.match(search.html, /Café Jelinek/)
    assert.doesNotMatch(search.html, /MuseumsQuartier/)
    const empty = await app.page('/?q=nothing-matches')
    assert.match(empty.html, /No places match/)
    const place = app.root.atlas.places().find((item) => item.name === 'Stadtpark')
    assert.ok(place !== undefined)
    const selected = await app.page(`/?place=${place.id}`)
    assert.match(selected.html, /Stadtpark/)
    assert.match(selected.html, /Park/)
  }))

test('the add form validates coordinates and creates a place', () =>
  withApp(async (app) => {
    const form = await app.page('/places/new')
    assert.match(form.html, /New place/)
    const invalid = await app.post('/places/new', { name: 'Bad', category: 'Food', kind: 'Café', note: 'x', lat: '91', lng: '16.3', collection: '' })
    assert.equal(invalid.status, 200)
    assert.match(await invalid.text(), /Latitude/)
    const created = await app.post('/places/new', { name: 'New stop', category: 'Food', kind: 'Bakery', note: 'Good bread.', lat: '48.2', lng: '16.36', collection: 'Vienna weekend' })
    assert.equal(created.status, 303)
    assert.equal(noticeOf(created).kind, 'ok')
    assert.equal(app.root.atlas.places().length, 9)
  }))

test('a note edit and the visited action persist', () =>
  withApp(async (app) => {
    const place = app.root.atlas.places()[0]
    assert.ok(place !== undefined)
    const edit = await app.page(`/places/${place.id}/edit`)
    assert.match(edit.html, /EDIT NOTE/)
    const saved = await app.post(`/places/${place.id}/note`, { note: 'A new note.', back: `/places/${place.id}/edit` })
    assert.equal(noticeOf(saved).kind, 'ok')
    assert.equal(app.root.atlas.place(place.id)?.note, 'A new note.')
    const visited = await app.post(`/places/${place.id}/visit`, { back: '/' })
    assert.equal(noticeOf(visited).kind, 'ok')
    assert.equal(app.root.atlas.place(place.id)?.visited, true)
  }))

test('collections and the GeoJSON export cover the atlas', () =>
  withApp(async (app) => {
    const page = await app.page('/collections')
    assert.equal(page.status, 200)
    assert.match(page.html, /Vienna weekend/)
    assert.match(page.html, /8 places/)
    const geo = await app.root.router.request('/export.geojson')
    assert.equal(geo.status, 200)
    const body = (await geo.json()) as { type: string; features: unknown[] }
    assert.equal(body.type, 'FeatureCollection')
    assert.equal(body.features.length, 8)
  }))

test('health, 404, prefix and the manifest work', async () => {
  await withApp(async (app) => {
    assert.equal((await app.page('/health')).status, 200)
    assert.equal((await app.page('/nope')).status, 404)
    assert.deepEqual(readManifest().plugins.map((row) => row.id), ['router', 'home', 'atlas', 'atlas-shell', 'workspace', 'places', 'collections', 'extensions', 'server', 'acryl-door'])
  })
  await withApp(async (app) => {
    const response = await app.root.router.request('/app', { headers: { accept: 'text/html' } })
    assert.equal(response.status, 200)
    assert.match(await response.text(), /href="\/app\/places\/new"/)
  }, { prefix: '/app' })
})

test('switching the workspace off leaves the add form reachable', async () => {
  const manifest = readManifest()
  const without = { ...manifest, plugins: manifest.plugins.map((row) => (row.id === 'workspace' ? { ...row, disabled: true } : row)) }
  const home = await mkdtemp(join(scratch, 'app-test-off-'))
  let ids = 0
  const app = await createApp(pinnedInstance(home, { root: projectRoot }), { listen: false, manifest: without, overrides: { atlas: { clock: () => NOW, newId: (kind: string) => `${kind}-${++ids}` } } })
  try {
    assert.equal((await app.root.router.request('/')).status, 404)
    assert.equal((await app.root.router.request('/places/new', { headers: { accept: 'text/html' } })).status, 200)
  } finally { await app.stop(); await rm(home, { recursive: true, force: true }) }
})

test('a failed save reports the error instead of success', async () => {
  const broken = { load: async (): Promise<AtlasState | undefined> => undefined, save: async (): Promise<void> => { throw new Error('disk full') } }
  await withApp(async (app) => {
    const place = app.root.atlas.places()[0]
    assert.ok(place !== undefined)
    const response = await app.post(`/places/${place.id}/note`, { note: 'x', back: '/' })
    assert.equal(noticeOf(response).kind, 'error')
    assert.match(noticeOf(response).text, /could not be saved/)
  }, { overrides: { atlas: { store: broken } } })
})
