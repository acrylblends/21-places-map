/** The atlas as a plugin: places in the app's data home, provided as `ctx.atlas`. */
import { randomUUID } from 'node:crypto'
import { isAbsolute, join } from 'node:path'
import type { Context } from '@deepseek-ai/cordis'
import type { AtlasState } from './domain.ts'
import { Atlas, type AtlasAdapters } from './atlas.ts'
import { jsonFileStore, type Store } from './store.ts'
export * from './atlas.ts'
export * from './domain.ts'
export const categoryColorOf = (category: 'Food' | 'Culture' | 'Nature' | 'Work'): string => ({ Food: '#d18142', Culture: '#487fbc', Nature: '#4b9869', Work: '#8c72bb' })[category]
export * from './store.ts'
export { seed } from './seed.ts'
declare module '@deepseek-ai/cordis' { interface Context { atlas: Atlas } }
export interface AtlasConfig { readonly store?: Store<AtlasState>; readonly clock?: () => Date; readonly newId?: AtlasAdapters['newId']; readonly file?: string }
export const name = 'atlas'
export const inject = ['appInstance']
export async function apply(ctx: Context, config: AtlasConfig = {}): Promise<void> {
  const file = config.file ?? 'places-map.json'
  const atlas = await Atlas.open({ store: config.store ?? jsonFileStore<AtlasState>(isAbsolute(file) ? file : join(ctx.appInstance.home, file), 'Places Map'), clock: config.clock ?? (() => new Date()), newId: config.newId ?? ((kind) => `${kind}-${randomUUID().slice(0, 8)}`) })
  ctx.provide('atlas', atlas)
}
