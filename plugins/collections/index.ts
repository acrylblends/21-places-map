/** Collections at `/collections`: the named lists with counts, plus category totals. */
import type { Context } from '@deepseek-ai/cordis'
import { Acryl } from '../acryl-router/src/index.ts'
import { CATEGORY_COLORS, type Atlas } from '../atlas/index.ts'
import type { Shell } from '../atlas-shell/index.ts'

export const name = 'collections'
export const inject = ['atlas', 'shell', 'router']

export function apply(ctx: Context): void {
  const { atlas, shell } = ctx
  const e = shell.e
  const prefix = shell.prefix
  const app = new Acryl().get('/collections', (c) => {
    const collections = atlas.collections()
    const categories = atlas.categories()
    const main = `${shell.notice(c.req.url)}<div class="pagehead"><div><small>FIELD ATLAS / COLLECTIONS</small><h1>Collections</h1><p>${String(atlas.places().length)} saved places · ${String(collections.length)} collections</p></div><a class="topbtn" href="${shell.href('/')}">Back to the map</a></div><div style="padding:18px 28px"><div class="filterrow">${categories.map((row) => `<span class="chip"><i style="display:inline-block;width:8px;height:8px;border-radius:50%;background:${CATEGORY_COLORS[row.category]};margin-right:6px"></i>${row.category}: ${String(row.count)}</span>`).join('')}</div>${collections.map((collection) => `<a class="place" href="${shell.href('/')}?collection=${encodeURIComponent(collection.name)}"><span class="dot" style="background:#276b4d"></span><span><strong>${e(collection.name)}</strong><small>${String(collection.count)} places</small></span></a>`).join('')}</div>`
    return c.html(shell.page({ title: 'Collections', main }))
  })
  ctx.router.route(prefix === '' ? '/' : prefix, app)
}
