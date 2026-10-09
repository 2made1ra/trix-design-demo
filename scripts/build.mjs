// Собирает dist/: хаб, по странице на каждый макет с холста и общие ассеты
import { cpSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { file, pages, route, systems } from './catalog.mjs'
import { hub, notFound } from './hub.mjs'

const root = join(import.meta.dirname, '..')
const src = join(root, 'boards')
const out = join(root, 'dist')
const write = (path, text) => {
  mkdirSync(dirname(join(out, path)), { recursive: true })
  writeFileSync(join(out, path), text)
}

rmSync(out, { recursive: true, force: true })
cpSync(join(root, 'public'), out, { recursive: true })
cpSync(src, join(out, 'assets/boards'), { recursive: true, filter: f => !/\.dc\.html$|canvas\.json$/.test(f) })
cpSync(join(root, 'runtime'), join(out, 'assets/demo'), { recursive: true })
for (const lib of ['react/umd/react.production.min.js', 'react-dom/umd/react-dom.production.min.js']) {
  cpSync(join(root, 'node_modules', lib), join(out, 'assets/vendor', lib.split('/').pop()))
}

const routes = Object.fromEntries(systems.flatMap(s => pages.map(p => [file(s, p), route(s, p)])))
const blobs = Object.fromEntries(readdirSync(join(root, 'public/blob')).map(f => [f.split('.')[0], `/blob/${f}`]))
const catalog = { systems: systems.map(({ slug, name }) => ({ slug, name })), pages: pages.map(({ slug, name }) => ({ slug, name })) }
const json = v => JSON.stringify(v).replace(/</g, '\\u003c')

function page(si, pi) {
  const s = systems[si]
  const p = pages[pi]
  const name = file(s, p)
  const fail = msg => {
    throw new Error(`${name}: ${msg}`)
  }
  const part = (re, what) => html.match(re)?.[1] ?? fail(`нет ${what}`)
  const html = readFileSync(join(src, name), 'utf8')
    .replace(/(?<![\w/.-])([\w-]+\.dc\.html)/g, (_, f) => routes[f] ?? fail(`ссылка на ${f} без страницы`))
    .replace(/\/_blob\/([0-9a-f]{32})/g, (_, id) => blobs[id] ?? fail(`нет файла public/blob/${id}.*`))
  if (/<(sc-for|sc-if|dc-import)\b/.test(html)) fail('sc-for, sc-if и dc-import не поддерживаются рантаймом')
  const head = part(/<head>([\s\S]*?)<\/head>/, '<head>')
    .replace(/<meta charset[^>]*>|<title>[\s\S]*?<\/title>|<script src="\.\/support\.js"><\/script>/g, '')
    .replace(/(src|href)="(?:\.\/)?(?![a-z]+:|\/|#)([^"]+)"/g, '$1="/assets/boards/$2"')
  const helmet = part(/<helmet>([\s\S]*?)<\/helmet>/, '<helmet>')
  const body = part(/<\/helmet>([\s\S]*?)<\/x-dc>/, '<x-dc>')
  const logic = part(/(<script type="text\/x-dc"[\s\S]*?<\/script>)/, 'data-dc-script')
  const react = body.includes('<x-import')
    ? '<script src="/assets/vendor/react.production.min.js"></script>\n<script src="/assets/vendor/react-dom.production.min.js"></script>'
    : ''
  const next = [si * pages.length + pi + 1, si * pages.length + pi - 1]
    .map(i => (i + systems.length * pages.length) % (systems.length * pages.length))
    .map(i => `<link rel="prefetch" href="${route(systems[Math.floor(i / pages.length)], pages[i % pages.length])}">`)
  return `<!doctype html>
<html lang="ru">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${p.name} — ${s.name} · TRIX</title>
<link rel="icon" href="/favicon.svg">
${next.join('\n')}
${react}
${head.trim()}
${helmet.trim()}
</head>
<body>
<div id="dc"></div>
<template id="dc-tpl">${body}</template>
${logic}
<script type="application/json" id="demo-meta">${json({ ...catalog, s: si, p: pi })}</script>
<script src="/assets/demo/dc-lite.js"></script>
<script src="/assets/demo/bar.js"></script>
</body>
</html>
`
}

systems.forEach((s, si) => {
  pages.forEach((p, pi) => {
    write(`${route(s, p)}.html`, page(si, pi))
  })
})
write('index.html', hub())
write('404.html', notFound())
console.log(`dist: хаб и ${systems.length * pages.length} страниц`)
