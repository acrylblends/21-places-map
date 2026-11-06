/** Places: the add form at `/places/new`, the note editor and the visited action. */
import type { Context } from '@deepseek-ai/cordis'
import { Acryl } from '../acryl-router/src/index.ts'
import { CATEGORIES, type Atlas, AtlasError } from '../atlas/index.ts'
import type { Shell } from '../atlas-shell/index.ts'

export const name = 'places'
export const inject = ['atlas', 'shell', 'router']

interface Values { readonly name: string; readonly category: string; readonly kind: string; readonly note: string; readonly lat: string; readonly lng: string; readonly collection: string }
const EMPTY: Values = { name: '', category: 'Culture', kind: '', note: '', lat: '48.2082', lng: '16.3738', collection: 'Vienna weekend' }

export function apply(ctx: Context): void {
  const { atlas, shell } = ctx
  const e = shell.e
  const prefix = shell.prefix

  const form = (url: string, values: Values, error?: string): string => {
    const main = `<div class="pagehead"><div><small>FIELD ATLAS / NEW PLACE</small><h1>Add a place</h1><p>Name it, classify it and write the note you will want later.</p></div><a class="topbtn" href="${shell.href('/')}">Back to the map</a></div><div>${shell.notice(url)}${error === undefined ? '' : `<p class="notice error" role="alert">${e(error)}</p>`}<form class="form" method="post" action="${shell.href('/places/new')}"><h2>New place</h2><p>Coordinates are sample values; the map is an illustrative local vector map.</p><label class="field"><span>NAME</span><input name="name" value="${e(values.name)}" placeholder="MuseumsQuartier" required></label><div class="formgrid"><label class="field"><span>CATEGORY</span><select name="category">${CATEGORIES.map((category) => `<option${category === values.category ? ' selected' : ''}>${category}</option>`).join('')}</select></label><label class="field"><span>KIND</span><input name="kind" value="${e(values.kind)}" placeholder="Gallery" required></label><label class="field"><span>LATITUDE</span><input name="lat" type="number" step="0.0001" value="${e(values.lat)}" required></label><label class="field"><span>LONGITUDE</span><input name="lng" type="number" step="0.0001" value="${e(values.lng)}" required></label></div><label class="field"><span>COLLECTION</span><input name="collection" value="${e(values.collection)}" placeholder="Vienna weekend"></label><label class="field"><span>NOTE</span><textarea name="note" required placeholder="Why is this place worth saving?">${e(values.note)}</textarea></label><div class="actions"><button class="primary" type="submit">Save place</button><a href="${shell.href('/')}">Cancel</a></div></form></div>`
    return shell.page({ title: 'Add a place', main })
  }

  const app = new Acryl()
    .get('/places/new', (c) => c.html(form(c.req.url, EMPTY)))
    .post('/places/new', async (c) => {
      const body = await c.req.parseBody()
      const values: Values = { name: String(body.name ?? ''), category: String(body.category ?? 'Culture'), kind: String(body.kind ?? ''), note: String(body.note ?? ''), lat: String(body.lat ?? ''), lng: String(body.lng ?? ''), collection: String(body.collection ?? '') }
      try {
        const place = await atlas.add(values)
        return c.redirect(shell.url(`/?place=${encodeURIComponent(place.id)}`, { kind: 'ok', text: `${place.name} was added to the atlas.` }), 303)
      } catch (error) {
        if (!(error instanceof AtlasError)) throw error
        return c.html(form(c.req.url, values, error.message))
      }
    })
    .get('/places/:id/edit', (c) => {
      const place = atlas.place(c.req.param('id'))
      if (place === undefined) return c.redirect(shell.url('/', { kind: 'error', text: 'That place no longer exists.' }), 303)
      const main = `${shell.notice(c.req.url)}<div class="pagehead"><div><small>FIELD ATLAS / EDIT NOTE</small><h1>${e(place.name)}</h1><p>${e(place.category)} · ${e(place.kind)} · ${place.lat.toFixed(4)}, ${place.lng.toFixed(4)}</p></div><a class="topbtn" href="${shell.href(`/?place=${encodeURIComponent(place.id)}`)}">Back to the map</a></div><form class="form" method="post" action="${shell.href(`/places/${encodeURIComponent(place.id)}/note`)}"><input type="hidden" name="back" value="${shell.href(`/?place=${encodeURIComponent(place.id)}`)}"><label class="field"><span>NOTE</span><textarea name="note" required>${e(place.note)}</textarea></label><div class="actions"><button class="primary" type="submit">Save note</button><a href="${shell.href(`/?place=${encodeURIComponent(place.id)}`)}">Cancel</a></div></form>`
      return c.html(shell.page({ title: `Edit ${place.name}`, main }))
    })
    .post('/places/:id/note', async (c) => {
      const body = await c.req.parseBody()
      const back = shell.back(body.back, `/places/${encodeURIComponent(c.req.param('id'))}/edit`)
      try {
        await atlas.updateNote(c.req.param('id'), body.note)
        return c.redirect(shell.url(back, { kind: 'ok', text: 'Note saved.' }), 303)
      } catch (error) {
        if (!(error instanceof AtlasError)) throw error
        return c.redirect(shell.url(back, { kind: 'error', text: error.message }), 303)
      }
    })
    .post('/places/:id/visit', async (c) => {
      const body = await c.req.parseBody()
      const back = shell.back(body.back, '/')
      try {
        const place = await atlas.toggleVisited(c.req.param('id'))
        return c.redirect(shell.url(back, { kind: 'ok', text: place.visited ? 'Marked visited.' : 'Marked not visited.' }), 303)
      } catch (error) {
        return c.redirect(shell.url(back, { kind: 'error', text: (error as Error).message }), 303)
      }
    })

  ctx.router.route(prefix === '' ? '/' : prefix, app)
}
