// Хаб со страницами сценария и справкой
import { pages, route } from './catalog.mjs'

const FONTS = 'https://fonts.googleapis.com/css2?family=Onest:wght@400;500;600&display=swap'

const CSS = `
:root{--bg:#f7f7f5;--card:#fff;--ink:#111114;--muted:#5d5d66;--line:#e3e3e0;--soft:#efefec;--acc:#1f4fd8;--r:16px}
@media (prefers-color-scheme:dark){:root:not([data-theme=light]){--bg:#111113;--card:#1a1a1d;--ink:#f2f2f3;--muted:#a3a3ad;--line:#2c2c31;--soft:#232327;--acc:#8ab0ff}}
:root[data-theme=dark]{--bg:#111113;--card:#1a1a1d;--ink:#f2f2f3;--muted:#a3a3ad;--line:#2c2c31;--soft:#232327;--acc:#8ab0ff}
*{box-sizing:border-box}
html{scroll-behavior:smooth;scroll-padding-top:80px}
body{margin:0;background:var(--bg);color:var(--ink);font:400 16px/1.55 Onest,system-ui,sans-serif;-webkit-font-smoothing:antialiased}
a{color:inherit}
:focus-visible{outline:2px solid var(--acc);outline-offset:2px}
h1,h2,h3,p,ol,ul,dl,dd{margin:0;padding:0}
ol,ul{list-style:none}
.wrap{max-width:1240px;margin:0 auto;padding:0 32px}
@media (max-width:640px){.wrap{padding:0 16px}}
.top{position:sticky;top:0;z-index:5;background:color-mix(in srgb,var(--bg) 86%,transparent);-webkit-backdrop-filter:blur(12px);backdrop-filter:blur(12px);border-bottom:1px solid var(--line)}
.top .wrap{display:flex;align-items:center;justify-content:space-between;gap:16px;min-height:64px}
.brand{display:flex;align-items:center;gap:10px;font-weight:600;text-decoration:none}
.brand img{width:28px;height:28px}
.brand span{color:var(--muted);font-weight:400}
.top nav{display:flex;align-items:center;gap:4px}
.top nav a{padding:8px 12px;border-radius:10px;font-size:14px;text-decoration:none;color:var(--muted)}
.top nav a:hover{background:var(--soft);color:var(--ink)}
@media (max-width:640px){.top nav a:not(.cta){display:none}.brand span{display:none}}
.cta{display:inline-flex;align-items:center;gap:8px;padding:10px 16px!important;border-radius:11px!important;background:var(--ink);color:var(--bg)!important;font-weight:500;text-decoration:none}
.cta:hover{opacity:.88}
.intro{padding:72px 0 48px}
.eyebrow{font-size:13px;font-weight:500;letter-spacing:.08em;text-transform:uppercase;color:var(--muted)}
.intro h1{max-width:820px;margin-top:14px;font-size:clamp(36px,5.4vw,64px);font-weight:600;line-height:1.04;letter-spacing:-.03em}
.intro p{max-width:640px;margin-top:20px;font-size:19px;color:var(--muted)}
.intro .actions{display:flex;flex-wrap:wrap;gap:12px;margin-top:32px}
.ghost{display:inline-flex;align-items:center;padding:10px 16px;border:1px solid var(--line);border-radius:11px;font-weight:500;text-decoration:none}
.ghost:hover{background:var(--card)}
.block{padding:56px 0}
.block>.wrap>h2{font-size:32px;font-weight:600;letter-spacing:-.02em;line-height:1.15}
.block>.wrap>.lead{max-width:680px;margin-top:10px;color:var(--muted)}
@media (max-width:400px){.list{grid-template-columns:1fr}}
.help{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(440px,100%),1fr));gap:16px;margin-top:16px}
.card{padding:24px;border:1px solid var(--line);border-radius:var(--r);background:var(--card)}
.card h3{font-size:18px;font-weight:600}
.card>p{margin-top:8px;font-size:15px;color:var(--muted)}
.card ul{display:flex;flex-direction:column;gap:10px;margin-top:14px;font-size:15px}
.card ul li{position:relative;padding-left:18px}
.card ul li::before{content:"";position:absolute;left:2px;top:.62em;width:6px;height:6px;border-radius:2px;background:var(--muted)}
.keys{display:grid;grid-template-columns:auto 1fr;gap:10px 18px;margin-top:14px;font-size:15px;align-items:center}
.keys dt{display:flex;gap:4px;white-space:nowrap}
kbd{display:inline-grid;place-items:center;min-width:28px;height:28px;padding:0 7px;border:1px solid var(--line);border-bottom-width:2px;border-radius:7px;background:var(--bg);font:500 13px/1 ui-monospace,SFMono-Regular,monospace}
.bar-demo{display:flex;flex-wrap:wrap;align-items:center;gap:6px;margin-top:16px;padding:6px;border-radius:12px;background:#121216;color:#f4f4f5;font-size:13px}
.bar-demo span{padding:6px 10px;border-radius:8px;background:rgba(255,255,255,.08)}
footer{padding:40px 0 56px;border-top:1px solid var(--line);font-size:14px;color:var(--muted)}
footer .wrap{display:flex;flex-wrap:wrap;justify-content:space-between;gap:12px}

.pages{display:grid;grid-template-columns:repeat(auto-fill,minmax(min(270px,100%),1fr));gap:16px;margin-top:32px}
.pg{display:flex;flex-direction:column;gap:8px;padding:22px;border:1px solid var(--line);border-radius:var(--r);background:var(--card);text-decoration:none;transition:border-color .2s,transform .2s}
.pg:hover{border-color:var(--ink);transform:translateY(-2px)}
.pg .no{font-size:13px;font-weight:500;color:var(--muted);font-variant-numeric:tabular-nums}
.pg h3{font-size:19px;font-weight:600;letter-spacing:-.01em}
.pg p{font-size:15px;color:var(--muted)}
.role{align-self:flex-start;margin-top:auto;padding:1px 8px;border-radius:99px;background:var(--soft);font-size:12px;color:var(--muted)}`



const esc = s => String(s).replace(/[&<>"]/g, c => `&#${c.charCodeAt(0)};`)
const first = route(pages[0])

const page = (title, main) => `<!doctype html>
<html lang="ru">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${title}</title>
<meta name="description" content="Дизайн TRIX «Франкенштейн»: ${pages.length} ключевых страниц с переходами по сценарию и настройками оформления.">
<link rel="icon" href="/favicon.svg">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="${FONTS}">
<style>${CSS}</style>
</head>
<body>
<header class="top"><div class="wrap">
<a class="brand" href="/"><img src="/favicon.svg" alt="">TRIX <span>· Франкенштейн</span></a>
<nav aria-label="Разделы"><a href="/#pages">Страницы</a><a href="/#help">Справка</a><a class="cta" href="${first}">Начать просмотр →</a></nav>
</div></header>
${main}
<footer><div class="wrap"><span>TRIX — дизайн «Франкенштейн». Макеты, не рабочее приложение.</span><a href="/#help">Как пользоваться</a></div></footer>
</body>
</html>
`

export const hub = () =>
  page(
    'TRIX — Франкенштейн',
    `<main>
<section class="intro"><div class="wrap">
<span class="eyebrow">Демо для команды</span>
<h1>Дизайн TRIX «Франкенштейн» на живых страницах</h1>
<p>${pages.length} экранов от главной до кабинета организатора — как на холсте, с теми же Tweaks. Пройдите сценарий и переключайте варианты оформления прямо на странице.</p>
<div class="actions"><a class="cta" href="${first}">Начать с главной →</a><a class="ghost" href="#help">Как смотреть</a></div>
</div></section>

<section class="block" id="pages"><div class="wrap">
<h2>Страницы</h2>
<p class="lead">В порядке сценария: гость, спикер, организатор.</p>
<ol class="pages">${pages
  .map(
    (p, i) => `<li><a class="pg" href="${route(p)}"><span class="no">${String(i + 1).padStart(2, '0')}</span><h3>${esc(p.name)}</h3><p>${esc(p.about)}</p><span class="role">${esc(p.role)}</span></a></li>`,
  )
  .join('')}</ol>
</div></section>

<section class="block" id="help"><div class="wrap">
<h2>Как пользоваться</h2>
<p class="lead">Страницы открываются как обычный сайт — во всю ширину окна, с прокруткой, ссылками и анимациями. Поверх каждой — небольшая панель просмотра.</p>
<div class="help">
<div class="card">
<h3>Панель просмотра</h3>
<p>Внизу экрана, поверх макета:</p>
<div class="bar-demo" aria-hidden="true"><span>Хаб</span><span>‹</span><span>Страница ▾</span><span>›</span><span>Tweaks</span><span>⌄</span></div>
<ul>
<li><b>‹ ›</b> и список — переходы по страницам сценария.</li>
<li><b>Tweaks</b> — боковая панель с настройками, число на кнопке — сколько изменено.</li>
<li><b>⌄</b> — спрятать панель. Вернуть — кнопкой в правом нижнем углу или клавишей <kbd>H</kbd>.</li>
</ul>
</div>
<div class="card">
<h3>Tweaks</h3>
<p>Те же переключатели, что на холсте, со значениями с холста по умолчанию.</p>
<ul>
<li><b>Для всех страниц</b> — палитра, футер и Verge Glow: меняются сразу на всём сайте.</li>
<li>Остальные разделы — для текущей страницы. Точка у варианта — значение с холста, кнопка ↺ возвращает его.</li>
<li>Поиск находит настройку по названию или варианту, «Изменённые» оставляет только то, что вы поменяли.</li>
<li>Настройки, которые сейчас ни на что не влияют, приглушены и подписаны — например, Glow без палитры Verge Glow.</li>
<li>Всё попадает в адрес: кнопка «Ссылка» копирует его вместе с настройками.</li>
</ul>
</div>
<div class="card">
<h3>Клавиши</h3>
<p>Работают на любой странице, кроме моментов, когда курсор стоит в поле ввода.</p>
<dl class="keys">
<dt><kbd>←</kbd><kbd>→</kbd></dt><dd>Предыдущая / следующая страница</dd>
<dt><kbd>1</kbd>–<kbd>${pages.length}</kbd></dt><dd>Страница по номеру</dd>
<dt><kbd>T</kbd></dt><dd>Открыть или закрыть Tweaks</dd>
<dt><kbd>/</kbd></dt><dd>Поиск по Tweaks</dd>
<dt><kbd>H</kbd></dt><dd>Спрятать или показать панель</dd>
<dt><kbd>Esc</kbd></dt><dd>Закрыть Tweaks</dd>
</dl>
</div>
<div class="card">
<h3>Для презентации и проверки</h3>
<ul>
<li>Включите полноэкранный режим браузера (<kbd>F11</kbd>, на Mac <kbd>⌃</kbd><kbd>⌘</kbd><kbd>F</kbd>) и спрячьте панель клавишей <kbd>H</kbd> — останется чистая страница.</li>
<li>Проверьте узкую ширину: сузьте окно или откройте ссылку с телефона — страницы адаптивные.</li>
<li>Данные вымышленные, а значения в квадратных скобках вроде [дата] — заполнители. Формы ничего не отправляют, а ссылки «#» никуда не ведут.</li>
<li>Если в системе включено «Уменьшение движения», эффекты курсора и появления отключаются — так задумано.</li>
</ul>
</div>
</div>
</div></section>
</main>`,
  )

export const notFound = () =>
  page(
    'Страница не найдена — TRIX',
    `<main><section class="intro"><div class="wrap">
<span class="eyebrow">404</span>
<h1>Такой страницы нет</h1>
<p>Возможно, ссылка устарела. Все страницы собраны в хабе.</p>
<div class="actions"><a class="cta" href="/">В хаб →</a></div>
</div></section></main>`,
  )
