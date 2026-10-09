// Собирает dist/: хаб, по странице на каждый макет с холста и общие ассеты
import { cpSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { file, pages, route, shared } from './catalog.mjs'
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
cpSync(src, join(out, 'assets/boards'), { recursive: true, filter: f => !f.endsWith('.dc.html') })
cpSync(join(root, 'runtime'), join(out, 'assets/demo'), { recursive: true })

const routes = Object.fromEntries(pages.map(p => [file(p), route(p)]))
const blobs = Object.fromEntries(readdirSync(join(root, 'public/blob')).map(f => [f.split('.')[0], `/blob/${f}`]))
const json = v => JSON.stringify(v).replace(/</g, '\\u003c')
const ENT = { quot: '"', amp: '&', lt: '<', gt: '>', '#39': "'" }
const schema = html =>
  JSON.parse(html.match(/data-props=(["'])([\s\S]*?)\1/)?.[2].replace(/&(quot|amp|lt|gt|#39);/g, (_, e) => ENT[e]) ?? '{}')

const home = schema(readFileSync(join(src, file(pages.find(p => p.id === shared.page))), 'utf8'))
const common = Object.fromEntries(Object.entries(home).filter(([, d]) => shared.section.test(d.section ?? '')))

function page(pi) {
  const p = pages[pi]
  const name = file(p)
  const fail = msg => {
    throw new Error(`${name}: ${msg}`)
  }
  const part = (re, what) => html.match(re)?.[1] ?? fail(`нет ${what}`)
  const html = readFileSync(join(src, name), 'utf8')
    .replace(/(?<![\w/.-])([\w-]+\.dc\.html)/g, (_, f) => routes[f] ?? fail(`ссылка на ${f} без страницы`))
    .replace(/\/_blob\/([0-9a-f]{32})/g, (_, id) => blobs[id] ?? fail(`нет файла public/blob/${id}.*`))
  if (/<(sc-for|sc-if|dc-import|x-import)\b/.test(html)) fail('sc-for, sc-if, dc-import и x-import не поддерживаются рантаймом')
  const head = part(/<head>([\s\S]*?)<\/head>/, '<head>')
    .replace(/<meta charset[^>]*>|<title>[\s\S]*?<\/title>|<script src="\.\/support\.js"><\/script>/g, '')
    .replace(/(src|href)="(?:\.\/)?(?![a-z]+:|\/|#)([^"]+)"/g, '$1="/assets/boards/$2"')
  const helmet = part(/<helmet>([\s\S]*?)<\/helmet>/, '<helmet>')
  const body = part(/<\/helmet>([\s\S]*?)<\/x-dc>/, '<x-dc>')
  const logic = part(/(<script type="text\/x-dc"[\s\S]*?<\/script>)/, 'data-dc-script')
  const next = [pi + 1, pi - 1].map(i => `<link rel="prefetch" href="${route(pages[(i + pages.length) % pages.length])}">`)
  const meta = { pages: pages.map(({ slug, name }) => ({ slug, name })), p: pi, shared: { prefix: shared.prefix, schema: common } }
  return `<!doctype html>
<html lang="ru">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${p.name} · TRIX</title>
<link rel="icon" href="/favicon.svg">
${next.join('\n')}
${head.trim()}
${helmet.trim()}
</head>
<body>
<div id="dc"></div>
<template id="dc-tpl">${body}</template>
${logic}
<script type="application/json" id="demo-meta">${json(meta)}</script>
<script src="/assets/demo/dc-lite.js"></script>
<script src="/assets/demo/bar.js"></script>
</body>
</html>
`
}

pages.forEach((p, pi) => write(`${route(p)}.html`, page(pi)))
write('index.html', hub())
write('404.html', notFound())
console.log(`dist: хаб и ${pages.length} страниц`)
