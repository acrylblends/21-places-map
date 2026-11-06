/** The Places Map shell: the Field Atlas bar with the search, Export and Add place actions. */
import type { Context } from '@deepseek-ai/cordis'
import { Acryl } from '../acryl-router/src/index.ts'
import type { Atlas } from '../atlas/index.ts'
import { createShell, escapeHtml, type Shell } from './core.ts'
import { STYLES } from './styles.ts'
export * from './core.ts'
export const APP_TITLE = 'Places Map'
export interface ShellConfig { readonly prefix?: string }
export const name = 'atlas-shell'
export const inject = ['atlas', 'router']
declare module '@deepseek-ai/cordis' { interface Context { shell: Shell } }
function topbar(href: (path: string) => string, q: string): string {
  return `<header class="top"><a class="brand" href="${href('/')}"><span class="brandmark">⌖</span>Field Atlas</a><span class="crumb">/ Places / <b>Vienna collection</b></span><form class="search" method="get" action="${href('/')}"><input name="q" value="${escapeHtml(q)}" placeholder="Search places, tags, notes…" aria-label="Search places"></form><a class="topbtn" href="${href('/export.geojson')}">Export</a><a class="primary" href="${href('/places/new')}">＋ Add place</a></header>`
}
export function apply(ctx: Context, config: ShellConfig = {}): void {
  const atlas: Atlas = ctx.atlas
  const prefix = config.prefix ?? ''
  const shell = createShell(prefix, { appTitle: APP_TITLE, css: STYLES, bodyClass: 'atlas', topbar })
  ctx.provide('shell', shell)
  ctx.router.route(prefix === '' ? '/' : prefix, new Acryl().get('/health', (c) => c.json({ ok: true })))
  void atlas
}
