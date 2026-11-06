/** The Vienna weekend collection: eight saved places with real coordinates and an illustrative position on the local map. */
import type { AtlasState, Category, Place } from './domain.ts'

interface Seed { name: string; category: Category; kind: string; note: string; lat: number; lng: number; x: number; y: number; hoursAgo: number; visited?: boolean }

const SEEDS: readonly Seed[] = [
  { name: 'MuseumsQuartier', category: 'Culture', kind: 'Gallery', note: 'A useful meeting point with open courtyards, good coffee and several small exhibitions. Save for a slow Saturday visit.', lat: 48.2029, lng: 16.3581, x: 22, y: 50, hoursAgo: 26 },
  { name: 'Café Jelinek', category: 'Food', kind: 'Coffee', note: 'Quiet tables upstairs, good for reading. Ask for the window seat before noon.', lat: 48.2025, lng: 16.3545, x: 40, y: 40, hoursAgo: 28 },
  { name: 'Stadtpark', category: 'Nature', kind: 'Park', note: 'The long paths are quiet before nine; the pond side has the better benches.', lat: 48.2047, lng: 16.3787, x: 63, y: 41, hoursAgo: 50, visited: true },
  { name: 'Haus des Meeres', category: 'Culture', kind: 'Museum', note: 'The aquarium floors are busy at weekends; the rooftop view is worth the stairs.', lat: 48.1977, lng: 16.3527, x: 49, y: 48, hoursAgo: 74 },
  { name: 'Impact Hub', category: 'Work', kind: 'Workspace', note: 'Day passes available; the phone booths fill up after lunch.', lat: 48.2006, lng: 16.3548, x: 22, y: 54, hoursAgo: 96 },
  { name: 'Naschmarkt', category: 'Food', kind: 'Market', note: 'Saturday morning is busy; the back rows have the better produce.', lat: 48.1987, lng: 16.3631, x: 60, y: 61, hoursAgo: 120, visited: true },
  { name: 'Burggarten', category: 'Nature', kind: 'Garden', note: 'A small garden behind the Hofburg; the glasshouse is free on the first Sunday.', lat: 48.2044, lng: 16.3653, x: 34, y: 68, hoursAgo: 150 },
  { name: 'Secession', category: 'Culture', kind: 'Architecture', note: 'The building is the exhibit; the basement Beethoven frieze is the reason to queue.', lat: 48.2007, lng: 16.3656, x: 78, y: 71, hoursAgo: 190 },
]
export function seed(now: Date, newId: (kind: string) => string): AtlasState {
  const places: Place[] = SEEDS.map((item) => ({
    id: newId('place'),
    name: item.name,
    category: item.category,
    kind: item.kind,
    note: item.note,
    lat: item.lat,
    lng: item.lng,
    x: item.x,
    y: item.y,
    addedAt: new Date(now.getTime() - item.hoursAgo * 3_600_000).toISOString(),
    collection: 'Vienna weekend',
    visited: item.visited === true,
  }))
  return { version: 1, places }
}
