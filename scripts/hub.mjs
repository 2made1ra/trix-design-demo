// Хаб со всеми вариантами, сравнением страниц и справкой
import { pages, route, systems } from './catalog.mjs'

const FONTS =
  'https://fonts.googleapis.com/css2?family=Onest:wght@400;500;600&family=Space+Grotesk:wght@500&family=Geist:wght@500&family=Cormorant+Garamond:wght@600&family=Inter:wght@300&family=Sofia+Sans+Extra+Condensed:wght@800&display=swap'

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
.stats{display:flex;flex-wrap:wrap;gap:12px 40px;margin-top:48px;padding-top:24px;border-top:1px solid var(--line)}
.stats div{display:flex;align-items:baseline;gap:10px;color:var(--muted)}
.stats b{font-size:28px;font-weight:600;color:var(--ink);letter-spacing:-.02em}
.block{padding:56px 0}
.block>.wrap>h2{font-size:32px;font-weight:600;letter-spacing:-.02em;line-height:1.15}
.block>.wrap>.lead{max-width:680px;margin-top:10px;color:var(--muted)}
.systems{display:grid;grid-template-columns:repeat(auto-fill,minmax(min(360px,100%),1fr));gap:20px;margin-top:32px}
.sys{display:flex;flex-direction:column;overflow:hidden;border:1px solid var(--line);border-radius:var(--r);background:var(--card)}
.look{position:relative;display:flex;flex-direction:column;justify-content:space-between;gap:24px;height:200px;padding:22px 24px;background:var(--lb);color:var(--li);text-decoration:none}
.look .n{font-size:13px;font-weight:500;opacity:.7}
.look .sample{font-family:var(--lf);font-size:52px;line-height:.95;letter-spacing:-.01em}
.look .sw{display:flex;gap:6px}
.look .sw i{width:22px;height:22px;border-radius:7px;box-shadow:0 0 0 1px color-mix(in srgb,var(--li) 22%,transparent)}
.look .go{position:absolute;right:20px;bottom:20px;display:inline-flex;align-items:center;gap:6px;padding:8px 14px;border-radius:10px;background:var(--li);color:var(--lb);font-size:14px;font-weight:500;transition:transform .2s}
.look:hover .go{transform:translateX(3px)}
.info{display:flex;flex-direction:column;gap:10px;padding:22px 24px 8px}
.info h3{font-size:22px;font-weight:600;letter-spacing:-.01em}
.info .tag{font-size:14px;font-weight:500;color:var(--ink)}
.info p{font-size:15px;color:var(--muted)}
.info .fonts{font-size:13px;color:var(--muted)}
.list{display:grid;grid-template-columns:1fr 1fr;gap:2px 12px;padding:12px 16px 18px}
.list a{display:flex;gap:8px;padding:7px 8px;border-radius:8px;font-size:14px;text-decoration:none}
.list a:hover{background:var(--soft)}
.list a span{min-width:16px;color:var(--muted);font-variant-numeric:tabular-nums}
@media (max-width:400px){.list{grid-template-columns:1fr}}
.table{margin-top:32px;overflow-x:auto;border:1px solid var(--line);border-radius:var(--r);background:var(--card)}
table{width:100%;min-width:760px;border-collapse:collapse;font-size:14px}
th,td{padding:12px 16px;border-bottom:1px solid var(--line);text-align:left;vertical-align:middle}
tr:last-child td{border-bottom:0}
thead th{font-size:13px;font-weight:600;color:var(--muted);white-space:nowrap}
tbody th{font-weight:500}
tbody th small{display:block;font-size:12.5px;font-weight:400;color:var(--muted)}
td a{display:inline-flex;align-items:center;gap:8px;padding:6px 10px;margin-left:-10px;border-radius:8px;text-decoration:none;white-space:nowrap}
td a:hover{background:var(--soft)}
td a i{width:10px;height:10px;border-radius:3px;background:var(--c)}
.role{display:inline-block;margin-top:4px;padding:1px 8px;border-radius:99px;background:var(--soft);font-size:12px;color:var(--muted)}
.steps{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(260px,100%),1fr));gap:16px;margin-top:32px}
.steps li{display:flex;flex-direction:column;gap:8px;padding:22px;border:1px solid var(--line);border-radius:var(--r);background:var(--card)}
.steps b{display:grid;place-items:center;width:30px;height:30px;border-radius:9px;background:var(--ink);color:var(--bg);font-size:14px}
.steps h3{margin-top:6px;font-size:18px;font-weight:600}
.steps p{font-size:15px;color:var(--muted)}
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
`

const esc = s => String(s).replace(/[&<>"]/g, c => `&#${c.charCodeAt(0)};`)
const first = route(systems[0], pages[0])

const card = s => `<article class="sys" style="--lb:${s.look.bg};--li:${s.look.ink};--lf:${s.display}">
<a class="look" href="${route(s, pages[0])}" aria-label="Открыть ${esc(s.name)}">
<span class="n">${esc(s.name)}</span>
<span class="sample" aria-hidden="true">Аа Bb</span>
<span class="sw" aria-hidden="true">${s.colors.map(c => `<i style="background:${c}"></i>`).join('')}</span>
<span class="go">Открыть →</span>
</a>
<div class="info">
<h3>${esc(s.name)}</h3>
<span class="tag">${esc(s.tagline)}</span>
<p>${esc(s.about)}</p>
<span class="fonts">Шрифты: ${esc(s.fonts)}</span>
</div>
<ol class="list" aria-label="Страницы ${esc(s.name)}">${pages
  .map((p, i) => `<li><a href="${route(s, p)}"><span>${i + 1}</span>${esc(p.name)}</a></li>`)
  .join('')}</ol>
</article>`

const matrix = `<div class="table"><table>
<thead><tr><th scope="col">Страница</th>${systems.map(s => `<th scope="col">${esc(s.name)}</th>`).join('')}</tr></thead>
<tbody>${pages
  .map(
    (p, i) => `<tr><th scope="row">${i + 1}. ${esc(p.name)}<small>${esc(p.about)}</small><span class="role">${esc(p.role)}</span></th>${systems
      .map(s => `<td><a href="${route(s, p)}" style="--c:${s.look.accent}" aria-label="${esc(p.name)} — ${esc(s.name)}"><i></i>Открыть</a></td>`)
      .join('')}</tr>`,
  )
  .join('')}</tbody>
</table></div>`

const page = (title, main) => `<!doctype html>
<html lang="ru">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${title}</title>
<meta name="description" content="Пять вариантов дизайна TRIX: по 8 ключевых страниц в каждом, с переходами по сценарию и настройками анимаций.">
<link rel="icon" href="/favicon.svg">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="${FONTS}">
<style>${CSS}</style>
</head>
<body>
<header class="top"><div class="wrap">
<a class="brand" href="/"><img src="/favicon.svg" alt="">TRIX <span>· варианты дизайна</span></a>
<nav aria-label="Разделы"><a href="/#systems">Варианты</a><a href="/#compare">Сравнение</a><a href="/#help">Справка</a><a class="cta" href="${first}">Начать просмотр →</a></nav>
</div></header>
${main}
<footer><div class="wrap"><span>TRIX — сравнение дизайн-систем. Макеты, не рабочее приложение.</span><a href="/#help">Как пользоваться</a></div></footer>
</body>
</html>
`

export const hub = () =>
  page(
    'TRIX — варианты дизайна',
    `<main>
<section class="intro"><div class="wrap">
<span class="eyebrow">Демо для команды</span>
<h1>${systems.length} вариантов дизайна TRIX на живых страницах</h1>
<p>Каждый вариант — это одни и те же ${pages.length} экранов: от главной до кабинета организатора. Откройте вариант, пройдите сценарий и сравните ту же страницу в соседних стилях.</p>
<div class="actions"><a class="cta" href="${first}">Начать с ${esc(systems[0].name)} →</a><a class="ghost" href="#help">Как смотреть</a></div>
<div class="stats"><div><b>${systems.length}</b><span>вариантов</span></div><div><b>${pages.length}</b><span>страниц в сценарии</span></div><div><b>${systems.length * pages.length}</b><span>макетов</span></div></div>
</div></section>

<section class="block" id="systems"><div class="wrap">
<h2>Варианты</h2>
<p class="lead">Нажмите на карточку, чтобы открыть главную страницу варианта, или сразу выберите нужную страницу из списка.</p>
<div class="systems">${systems.map(card).join('')}</div>
</div></section>

<section class="block" id="compare"><div class="wrap">
<h2>Сравнить одну страницу</h2>
<p class="lead">Строки — страницы сценария, столбцы — варианты. Внутри макета то же самое делают клавиши <kbd>⇧</kbd> <kbd>↑</kbd> / <kbd>↓</kbd>.</p>
${matrix}
</div></section>

<section class="block" id="help"><div class="wrap">
<h2>Как пользоваться</h2>
<p class="lead">Страницы открываются как обычный сайт — во всю ширину окна, с прокруткой, ссылками и анимациями. Поверх каждой — небольшая панель просмотра.</p>
<ol class="steps">
<li><b>1</b><h3>Выберите вариант</h3><p>Карточка в разделе «Варианты» открывает главную страницу, список под ней — любую из ${pages.length} страниц.</p></li>
<li><b>2</b><h3>Пройдите сценарий</h3><p>Стрелки <kbd>←</kbd> <kbd>→</kbd> листают страницы по порядку. После последней страницы откроется первая страница следующего варианта.</p></li>
<li><b>3</b><h3>Сравните</h3><p><kbd>⇧</kbd> <kbd>↑</kbd> / <kbd>↓</kbd> или цифры <kbd>1</kbd>–<kbd>${systems.length}</kbd> откроют ту же страницу в другом варианте — удобно сравнивать детали.</p></li>
</ol>
<div class="help">
<div class="card">
<h3>Панель просмотра</h3>
<p>Внизу экрана, поверх макета:</p>
<div class="bar-demo" aria-hidden="true"><span>Хаб</span><span>‹</span><span>Вариант ▾</span><span>Страница ▾</span><span>›</span><span>Настройки</span><span>⌄</span></div>
<ul>
<li><b>Хаб</b> — вернуться на эту страницу.</li>
<li><b>‹ ›</b> — предыдущая и следующая страница сценария.</li>
<li><b>Вариант</b> и <b>Страница</b> — перейти куда угодно из выпадающих списков.</li>
<li><b>Настройки</b> — анимации и оформление этой страницы.</li>
<li><b>⌄</b> — спрятать панель, чтобы она не мешала. Вернуть — кнопкой в правом нижнем углу или клавишей <kbd>H</kbd>.</li>
</ul>
</div>
<div class="card">
<h3>Клавиши</h3>
<p>Работают на любой странице макета, кроме моментов, когда курсор стоит в поле ввода.</p>
<dl class="keys">
<dt><kbd>←</kbd><kbd>→</kbd></dt><dd>Предыдущая / следующая страница</dd>
<dt><kbd>⇧</kbd><kbd>↑</kbd><kbd>↓</kbd></dt><dd>Та же страница в соседнем варианте</dd>
<dt><kbd>1</kbd>–<kbd>${systems.length}</kbd></dt><dd>Вариант по номеру: ${systems.map((s, i) => `${i + 1} — ${esc(s.name)}`).join(', ')}</dd>
<dt><kbd>T</kbd></dt><dd>Открыть или закрыть настройки</dd>
<dt><kbd>H</kbd></dt><dd>Спрятать или показать панель</dd>
<dt><kbd>Esc</kbd></dt><dd>Закрыть настройки</dd>
</dl>
</div>
<div class="card">
<h3>Настройки страницы</h3>
<p>Те же переключатели, что в Tweaks на холсте. Набор зависит от страницы.</p>
<ul>
<li><b>Эффект курсора</b> — слова, линза-негатив, перекрестие или выключен; размер букв и где работает: «как было», весь белый фон, фон и карточки, только карточки.</li>
<li><b>Появление</b>, <b>Заголовки</b>, <b>Бегущая строка</b>, <b>Лента</b> — анимации The Verge и лендингов мероприятий.</li>
<li><b>Оформление организатора</b> и <b>Посетитель</b> — цвет и обложка мероприятия, вид для гостя или спикера.</li>
<li>Выбор запоминается для страницы в этом браузере и сразу попадает в адрес. Кнопка «Ссылка» копирует адрес с настройками, «Сбросить» возвращает исходный вид.</li>
</ul>
</div>
<div class="card">
<h3>Для презентации и проверки</h3>
<ul>
<li>Включите полноэкранный режим браузера (<kbd>F11</kbd>, на Mac <kbd>⌃</kbd><kbd>⌘</kbd><kbd>F</kbd>) и спрячьте панель клавишей <kbd>H</kbd> — останется чистая страница.</li>
<li>Проверьте узкую ширину: сузьте окно или откройте ссылку с телефона — страницы адаптивные.</li>
<li>Данные вымышленные, а значения в квадратных скобках вроде [Дата] — заполнители. Формы ничего не отправляют, а ссылки «#» никуда не ведут.</li>
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
<p>Возможно, ссылка устарела. Все варианты и страницы собраны в хабе.</p>
<div class="actions"><a class="cta" href="/">В хаб →</a></div>
</div></section></main>`,
  )
