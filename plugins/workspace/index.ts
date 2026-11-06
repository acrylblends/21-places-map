/** The primary map workspace at `/`: saved places, category filters, search, markers and the selected place detail. */
import type { Context } from '@deepseek-ai/cordis'
import { Acryl } from '../acryl-router/src/index.ts'
import { CATEGORY_COLORS, CATEGORIES, whenText, type Atlas, type Category, type Place } from '../atlas/index.ts'
import type { Shell } from '../atlas-shell/index.ts'

export const name = 'workspace'
export const inject = ['atlas', 'shell', 'router']

function mapSvg(places: readonly Place[], href: (path: string) => string, filter: string): string {
  const pins = places
    .map((place) => `<a class="pin" href="${href(`/?place=${encodeURIComponent(place.id)}${filter === '' ? '' : `&${filter}`}`)}"><circle cx="${String(Math.round((place.x / 100) * 900))}" cy="${String(Math.round((place.y / 100) * 650))}" r="11" fill="${CATEGORY_COLORS[place.category]}"><title>${place.name}</title></circle></a>`)
    .join('')
  return `<svg viewBox="0 0 900 650" preserveAspectRatio="xMidYMid slice" aria-label="Illustrative map of central Vienna"><path d="M0 90 Q190 150 350 90 T900 125 L900 240 Q650 205 520 270 T0 240Z" fill="#d3e6e5"/><path d="M-30 500 Q170 410 270 475 T560 450 T920 500" stroke="#fff" stroke-width="26" fill="none"/><g stroke="#fff" stroke-width="13" fill="none"><path d="M40 0L170 650M300 -30L410 680M570 -20L680 680M820 -20L760 680M0 190L920 320M-10 350L900 420M0 570L900 540"/><path d="M90 -20L500 650M460 -30L100 650M900 180L0 430" stroke-width="7"/></g><g fill="#cddfc9"><path d="M55 300l130-45 35 95-145 65zM610 330l125-45 60 85-130 70zM360 30l120 10-25 60-130-10z"/></g><g class="map-label"><text x="180" y="270">INNERE STADT</text><text x="590" y="150">LEOPOLDSTADT</text><text x="660" y="475">LANDSTRASSE</text><text x="95" y="555">MARIAHILF</text><text x="390" y="400">RINGSTRASSE</text></g>${pins}</svg>`
}

export function apply(ctx: Context): void {
  const { atlas, shell } = ctx
  const e = shell.e
  const prefix = shell.prefix

  const app = new Acryl()
    .get('/', (c) => {
      const q = (c.req.query('q') ?? '').slice(0, 100)
      const categoryText = c.req.query('category')
      const category = CATEGORIES.includes(categoryText as Category) ? (categoryText as Category) : undefined
      const collection = c.req.query('collection')
      const list = atlas.places({ q, ...(category === undefined ? {} : { category }), ...(collection === undefined ? {} : { collection }) })
      const selected = atlas.place(c.req.query('place') ?? '') ?? list[0] ?? atlas.places()[0]
      const filter = [q === '' ? '' : `q=${encodeURIComponent(q)}`, category === undefined ? '' : `category=${category}`, collection === undefined ? '' : `collection=${encodeURIComponent(collection)}`].filter((part) => part !== '').join('&')
      const chips = [{ label: 'All places', value: undefined }, ...CATEGORIES.map((value) => ({ label: value, value }))]
        .map((chip) => `<a class="chip${category === chip.value ? ' active' : ''}" href="${shell.href('/')}?${[q === '' ? '' : `q=${encodeURIComponent(q)}`, chip.value === undefined ? '' : `category=${chip.value}`].filter((part) => part !== '').join('&')}">${chip.label}</a>`)
        .join('')
      const rows = list
        .map((place) => `<a class="place${place.id === selected?.id ? ' selected' : ''}" href="${shell.href(`/?place=${encodeURIComponent(place.id)}${filter === '' ? '' : `&${filter}`}`)}"><span class="dot" style="background:${CATEGORY_COLORS[place.category]}"></span><span><strong>${e(place.name)}</strong><small>${e(place.category)} · ${e(place.kind)}${place.visited ? ' · visited' : ''}</small></span></a>`)
        .join('')
      const detail = selected === undefined
        ? '<aside class="side right empty">No place selected.</aside>'
        : `<aside class="side right"><div class="detailtop"><span class="tiny">PLACE DETAILS</span><a class="chip" href="${shell.href(`/places/${encodeURIComponent(selected.id)}/edit`)}">Edit note</a></div><h2 class="detailname">${e(selected.name)}</h2><span class="tag">${e(selected.category)} · ${e(selected.kind)}</span><p class="detailp">${e(selected.note)}</p><div class="preview"></div><div class="coord"><span>Coordinates</span><b>${selected.lat.toFixed(4)}, ${selected.lng.toFixed(4)}</b></div><div class="coord"><span>Added</span><b>${e(whenText(selected.addedAt, atlas.now))}</b></div><div class="coord"><span>Collection</span><b>${e(selected.collection === '' ? 'Unfiled' : selected.collection)}</b></div><a class="primary" style="display:block;text-align:center;width:100%;margin-top:16px;padding:10px;font-size:12px" href="https://www.openstreetmap.org/?mlat=${String(selected.lat)}&mlon=${String(selected.lng)}#map=17/${String(selected.lat)}/${String(selected.lng)}" target="_blank" rel="noreferrer">Open directions ↗</a><div style="display:flex;gap:7px;margin-top:9px"><form method="post" action="${shell.href(`/places/${encodeURIComponent(selected.id)}/visit`)}" style="flex:1"><input type="hidden" name="back" value="${e(c.req.url)}"><button class="topbtn" style="width:100%;padding:8px;font-size:11px" type="submit">${selected.visited ? 'Mark not visited' : 'Mark visited'}</button></form><a class="topbtn" style="padding:8px 10px;font-size:11px" href="${shell.href(`/places/${encodeURIComponent(selected.id)}/edit`)}">Edit note</a></div></aside>`
      const main = `<main class="workspace">${shell.notice(c.req.url)}<aside class="side left"><div class="heading"><h2>Saved places <span class="tiny">${String(list.length).padStart(2, '0')}</span></h2><span class="tiny">SORT: RECENT</span></div><div class="filterrow">${chips}</div><div>${rows === '' ? '<p class="empty">No places match. Clear the search or the filter.</p>' : rows}</div><p class="tiny" style="margin:18px 4px">COLLECTION · PERSONAL ATLAS<br><b style="color:#34473a">${collection === undefined ? 'Vienna weekend shortlist' : e(collection)}</b></p></aside><section class="mapwrap"><div class="map">${mapSvg(list, shell.href, filter)}</div><div class="maptools"><button type="button" data-toast="Zoomed in">＋</button><button type="button" data-toast="Zoomed out">−</button><button type="button" data-toast="Centred on the saved places">◎</button></div><div class="maplegend"><span><i style="background:#d18142"></i>Food</span><span><i style="background:#487fbc"></i>Culture</span><span><i style="background:#4b9869"></i>Nature</span><span><i style="background:#8c72bb"></i>Work</span></div></section>${detail}</main>`
      return c.html(shell.page({ title: 'Field Atlas', q, main }))
    })
    .get('/export.geojson', (c) => {
      c.header('content-disposition', 'attachment; filename="vienna-places.geojson"')
      return c.json(atlas.geoJson())
    })

  ctx.router.route(prefix === '' ? '/' : prefix, app)
}
