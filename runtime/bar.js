// Панель просмотра поверх макета: хаб, переходы по сценарию и боковая панель Tweaks. В Shadow DOM, чтобы стили макета её не задевали
;(() => {
  const { pages, p } = JSON.parse(document.getElementById('demo-meta').textContent)
  const go = i => location.assign(`/${pages[(i + pages.length) % pages.length].slug}`)
  const store = (k, v) => {
    try {
      return v === undefined ? localStorage.getItem(k) : v === null ? localStorage.removeItem(k) : localStorage.setItem(k, v)
    } catch {}
  }
  const LABELS = {
    palette: 'Палитра',
    footer: 'Футер',
    glowTiles: 'Glow: карточки',
    glowButtons: 'Glow: кнопки',
    glowTicker: 'Glow: бегущая строка',
    glowPage: 'Glow: фон страницы',
    glowMotion: 'Glow: движение',
    glowFooterEdge: 'Glow: край футера',
    glowSideEdge: 'Край панели',
    heroMotion: 'Анимация',
    heroColor: 'Цвет',
    heroGlow: 'Свечение',
    glowAccent: 'Акцент Verge Glow',
    cards: 'Цвета карточек',
    card04: 'Карточка 04',
    cardMotion: 'Анимация',
    cardSide: 'Текст и карточка',
    cursor: 'Режим',
    zone: 'Где работает',
    text: 'Текст',
    fade: 'Затухание',
    letters: 'Размер букв',
    spread: 'Разброс',
    freq: 'Частота',
    tone: 'Тон',
    reveal: 'Блоки',
    display: 'Стиль',
    ticker: 'Режим',
    rail: 'Линия',
    accent: 'Акцент',
    cover: 'Обложка',
    visitor: 'Кто смотрит',
    bottom: 'Вариант',
  }
  // Tweak действует только при условии: иначе строка приглушена и объясняет почему
  const glow = v => v.palette === 'Verge Glow' || 'Работает с палитрой Verge Glow'
  const trail = v => v.cursor !== 'Выкл' || 'След курсора выключен'
  const NEEDS = {
    ...Object.fromEntries(['glowTiles', 'glowButtons', 'glowTicker', 'glowPage', 'glowMotion', 'glowFooterEdge', 'glowSideEdge', 'glowAccent'].map(k => [k, glow])),
    ...Object.fromEntries(['zone', 'text', 'fade', 'letters', 'spread', 'freq', 'tone'].map(k => [k, trail])),
    card04: v => v.cards === 'Мята и дымка' || 'Работает в цветах «Мята и дымка»',
  }
  const SHARED = 'Для всех страниц'
  const icon = d => `<svg viewBox="0 0 24 24" aria-hidden="true">${d}</svg>`
  const I = {
    hub: icon('<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>'),
    prev: icon('<path d="m15 6-6 6 6 6"/>'),
    next: icon('<path d="m9 6 6 6-6 6"/>'),
    tune: icon('<path d="M4 7h10M18 7h2M4 17h4M12 17h8"/><circle cx="16" cy="7" r="2"/><circle cx="10" cy="17" r="2"/>'),
    hide: icon('<path d="m6 9 6 6 6-6"/>'),
    show: icon('<path d="m6 15 6-6 6 6"/>'),
    link: icon('<path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1"/>'),
    undo: icon('<path d="M4 9h11a5 5 0 0 1 0 10h-4"/><path d="m8 5-4 4 4 4"/>'),
    close: icon('<path d="M6 6l12 12M18 6 6 18"/>'),
    find: icon('<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>'),
    chev: icon('<path d="m6 9 6 6 6-6"/>'),
  }
  const esc = v => String(v).replace(/[&<>"]/g, c => `&#${c.charCodeAt(0)};`)
  const opt = (list, cur) => list.map((x, i) => `<option value="${i}"${i === cur ? ' selected' : ''}>${esc(x)}</option>`).join('')

  const el = document.createElement('trix-demo-bar')
  const root = el.attachShadow({ mode: 'open' })
  root.innerHTML = `<style>
:host{all:initial;font:500 13px/1.3 system-ui,-apple-system,'Segoe UI',Roboto,sans-serif;color:#f4f4f5;-webkit-font-smoothing:antialiased}
*{box-sizing:border-box}
[hidden]{display:none!important}
svg{width:18px;height:18px;fill:none;stroke:currentColor;stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round;flex:none}
button{font:inherit;color:inherit}
.glass{background:rgba(18,18,22,.92);-webkit-backdrop-filter:blur(14px) saturate(1.4);backdrop-filter:blur(14px) saturate(1.4);border:1px solid rgba(255,255,255,.1);box-shadow:0 12px 40px rgba(0,0,0,.28),0 2px 6px rgba(0,0,0,.2)}
.wrap{position:fixed;left:0;right:0;bottom:0;z-index:2147483000;display:flex;flex-direction:column;align-items:center;gap:10px;padding:0 12px 16px;pointer-events:none}
.bar,.toast{pointer-events:auto}
.bar{display:flex;align-items:center;gap:4px;max-width:100%;padding:5px;border-radius:14px}
.btn{position:relative;display:inline-flex;align-items:center;justify-content:center;gap:7px;height:36px;min-width:36px;padding:0 10px;border:0;border-radius:9px;background:none;color:inherit;text-decoration:none;cursor:pointer;white-space:nowrap}
.btn:hover{background:rgba(255,255,255,.1)}
.btn[aria-expanded=true]{background:#f4f4f5;color:#111}
:focus-visible{outline:2px solid #8ab4ff;outline-offset:1px}
.sep{width:1px;height:20px;margin:0 4px;background:rgba(255,255,255,.14);flex:none}
.pick{position:relative;display:flex;min-width:0}
select{appearance:none;height:36px;min-width:0;max-width:240px;padding:0 26px 0 10px;border:0;border-radius:9px;background:rgba(255,255,255,.07) url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23a1a1aa' stroke-width='2' stroke-linecap='round'%3E%3Cpath d='m7 10 5 5 5-5'/%3E%3C/svg%3E") right 6px center/16px no-repeat;color:inherit;font:inherit;font-weight:650;text-overflow:ellipsis;cursor:pointer}
select:hover{background-color:rgba(255,255,255,.13)}
option{color:#111;background:#fff}
.n{display:inline-grid;place-items:center;min-width:18px;height:18px;padding:0 5px;border-radius:9px;background:#3cffd0;color:#111;font-size:11px;font-weight:700}
.sr{position:absolute;width:1px;height:1px;overflow:hidden;clip-path:inset(50%)}
.fab{position:fixed;right:16px;bottom:16px;z-index:2147483000;display:grid;place-items:center;width:44px;height:44px;border-radius:12px;cursor:pointer}
.toast{padding:9px 14px;border-radius:10px;font-size:12.5px;color:#e4e4e7}
kbd{display:inline-block;min-width:20px;padding:1px 5px;border-radius:5px;background:rgba(255,255,255,.12);font:600 11px/1.5 ui-monospace,monospace;text-align:center}

.panel{position:fixed;top:12px;right:12px;bottom:12px;z-index:2147483001;display:flex;flex-direction:column;width:380px;border-radius:16px;overflow:hidden;animation:in .22s cubic-bezier(.2,.8,.2,1)}
@keyframes in{from{opacity:0;transform:translateX(16px)}}
.ph{display:flex;align-items:flex-start;gap:12px;padding:16px 12px 12px 18px}
.ph div{flex:1;min-width:0}
.ph b{display:block;font-size:15px}
.ph span{font-size:12px;color:#a1a1aa}
.tools{display:flex;gap:6px;padding:0 12px 12px}
.find{display:flex;flex:1;min-width:0;align-items:center;gap:8px;height:34px;padding:0 10px;border-radius:9px;background:rgba(255,255,255,.08);color:#a1a1aa}
.find:focus-within{box-shadow:0 0 0 2px #8ab4ff}
.find input{flex:1;min-width:0;border:0;background:none;outline:0;color:#f4f4f5;font:inherit}
.find input::placeholder{color:#8b8b94}
.tg{height:34px;padding:0 10px;border:1px solid rgba(255,255,255,.14);border-radius:9px;background:none;font-size:12px;color:#d4d4d8;cursor:pointer;white-space:nowrap}
.tg[aria-pressed=true]{background:#f4f4f5;border-color:#f4f4f5;color:#111}
.tg:disabled{opacity:.4;cursor:default}
.body{flex:1;overflow:auto;padding:0 12px 12px;overscroll-behavior:contain;border-top:1px solid rgba(255,255,255,.08)}
.sec{border-bottom:1px solid rgba(255,255,255,.08)}
.sh{display:flex;align-items:center;gap:8px;width:100%;padding:14px 6px 10px;border:0;background:none;text-align:left;cursor:pointer}
.sh b{font-size:11px;font-weight:650;letter-spacing:.08em;text-transform:uppercase;color:#d4d4d8}
.sh .all{padding:2px 7px;border-radius:99px;background:rgba(60,255,208,.14);color:#3cffd0;font-size:10.5px;font-weight:600}
.sh .c{margin-left:auto;font-size:11.5px;color:#3cffd0}
.sh svg{width:16px;height:16px;color:#8b8b94;transition:transform .2s}
.sh[aria-expanded=false] svg{transform:rotate(-90deg)}
.rows{display:grid;gap:14px;padding:2px 6px 16px}
.row{display:grid;gap:7px}
.row.dim .opts{opacity:.45}
.row.inline{grid-template-columns:minmax(0,1fr) 168px;align-items:center;gap:12px}
.rh{display:flex;flex-wrap:wrap;align-items:center;gap:6px;min-height:22px;font-size:12.5px;color:#e4e4e7}
.rh .hint{font-size:11.5px;color:#a1a1aa}
.rh .dot{width:6px;height:6px;border-radius:50%;background:#3cffd0}
.undo{display:grid;place-items:center;width:22px;height:22px;margin-left:auto;padding:0;border:0;border-radius:6px;background:none;color:#a1a1aa;cursor:pointer}
.undo:hover{background:rgba(255,255,255,.1);color:#f4f4f5}
.undo svg{width:14px;height:14px}
.opts{display:flex;flex-wrap:wrap;gap:6px}
.opts.seg{display:grid;grid-auto-columns:1fr;grid-auto-flow:column;gap:2px;padding:2px;border-radius:9px;background:rgba(255,255,255,.07)}
.chip{position:relative;min-height:32px;padding:6px 11px;border:1px solid rgba(255,255,255,.14);border-radius:8px;background:none;color:#e4e4e7;font-size:12.5px;cursor:pointer;transition:background .15s,border-color .15s}
.seg .chip{min-height:30px;padding:5px 8px;border:0;border-radius:7px}
.chip:hover{border-color:rgba(255,255,255,.4);background:rgba(255,255,255,.06)}
.chip[aria-checked=true]{background:#f4f4f5;border-color:#f4f4f5;color:#111;font-weight:600}
.chip.def::after{content:"";position:absolute;top:4px;right:4px;width:4px;height:4px;border-radius:50%;background:currentColor;opacity:.45}
.chip i{display:inline-block;width:12px;height:12px;margin-right:6px;border-radius:4px;vertical-align:-1px;box-shadow:inset 0 0 0 1px rgba(255,255,255,.3)}
.chip mark{background:rgba(60,255,208,.35);color:inherit;border-radius:2px}
.empty{padding:28px 6px;color:#a1a1aa;text-align:center}
.pf{display:flex;flex-wrap:wrap;align-items:center;gap:6px;padding:12px;border-top:1px solid rgba(255,255,255,.08)}
.pf .btn{height:32px;font-size:12px;background:rgba(255,255,255,.07)}
.pf .btn:hover{background:rgba(255,255,255,.14)}
.pf p{flex-basis:100%;margin:4px 2px 0;font-size:11.5px;line-height:1.45;color:#8b8b94}
:host([open]) .wrap{padding-right:404px}
@media (max-width:720px){:host([open]) .wrap{padding-right:8px}.lbl{display:none}select{max-width:42vw}.wrap{padding:0 8px 10px}
.panel{top:auto;left:8px;right:8px;bottom:8px;width:auto;max-height:72vh;animation-name:up}.pf p{display:none}}
@keyframes up{from{opacity:0;transform:translateY(16px)}}
@media (prefers-reduced-motion:reduce){.panel{animation:none}}
@media print{:host{display:none}}
</style>
<aside class="panel glass" hidden role="dialog" aria-label="Tweaks страницы">
<div class="ph"><div><b>Tweaks</b><span>${esc(pages[p].name)} · <span data-sum></span></span></div>
<button class="btn" data-close title="Закрыть (Esc)" aria-label="Закрыть">${I.close}</button></div>
<div class="tools">
<label class="find">${I.find}<span class="sr">Поиск</span><input type="search" placeholder="Найти настройку или вариант" data-find></label>
<button class="tg" data-only aria-pressed="false" title="Показать только изменённые">Изменённые</button>
</div>
<div class="body" data-body></div>
<div class="pf">
<button class="btn" data-copy title="Скопировать адрес с текущими настройками">${I.link}Ссылка</button>
<button class="btn" data-reset title="Вернуть все настройки как на холсте">${I.undo}Сбросить всё</button>
<p>Точка в углу варианта — значение с холста. Настройки «${SHARED.toLowerCase()}» общие для сайта, остальные — для этой страницы. Всё попадает в адрес.</p>
</div>
</aside>
<div class="wrap">
<div class="toast glass" hidden></div>
<nav class="bar glass" aria-label="Просмотр макетов">
<a class="btn" href="/" title="Все страницы">${I.hub}<span class="lbl">Хаб</span></a>
<span class="sep"></span>
<button class="btn" data-go="-1" title="Предыдущая страница (←)" aria-label="Предыдущая страница">${I.prev}</button>
<label class="pick"><span class="sr">Страница</span><select data-page>${opt(pages.map((x, i) => `${i + 1}. ${x.name}`), p)}</select></label>
<button class="btn" data-go="1" title="Следующая страница (→)" aria-label="Следующая страница">${I.next}</button>
<span class="sep"></span>
<button class="btn" data-tune aria-expanded="false" title="Tweaks (T)">${I.tune}<span class="lbl">Tweaks</span><span class="n" data-n hidden></span></button>
<button class="btn" data-hide title="Скрыть панель (H)" aria-label="Скрыть панель">${I.hide}</button>
</nav>
</div>
<button class="fab glass" hidden title="Показать панель (H)" aria-label="Показать панель">${I.show}</button>`

  const $ = q => root.querySelector(q)
  const bar = $('.wrap')
  const fab = $('.fab')
  const panel = $('.panel')
  const body = $('[data-body]')
  const find = $('[data-find]')
  const only = $('[data-only]')
  const tune = $('[data-tune]')
  const toast = $('.toast')
  const closed = new Set(JSON.parse(store('demo:closed') ?? '[]'))
  let timer

  const say = (html, ms = 2400) => {
    toast.innerHTML = html
    toast.hidden = false
    clearTimeout(timer)
    timer = setTimeout(() => (toast.hidden = true), ms)
  }
  const hide = on => {
    bar.hidden = on
    fab.hidden = !on
    if (on) open(false)
    store('demo:hidden', on ? '1' : null)
  }
  const open = on => {
    panel.hidden = !on
    tune.setAttribute('aria-expanded', on)
    el.toggleAttribute('open', on)
    store('demo:panel', on ? '1' : null)
    if (on) draw()
  }

  const items = () => {
    const { schema } = window.DCLite
    return Object.entries(schema)
      .filter(([, d]) => d.editor)
      .map(([k, d]) => ({ k, d, sec: d.shared ? SHARED : (d.section ?? 'Прочее'), label: LABELS[k] ?? k }))
  }
  const changed = () => {
    const v = window.DCLite.values()
    const def = window.DCLite.defaults()
    return items().filter(({ k }) => v[k] !== def[k])
  }

  function draw() {
    const v = window.DCLite.values()
    const def = window.DCLite.defaults()
    const q = find.value.trim().toLowerCase()
    const hit = s => !q || s.toLowerCase().includes(q)
    const mark = s => {
      const i = q ? s.toLowerCase().indexOf(q) : -1
      return i < 0 ? esc(s) : `${esc(s.slice(0, i))}<mark>${esc(s.slice(i, i + q.length))}</mark>${esc(s.slice(i + q.length))}`
    }
    const onlyChanged = only.getAttribute('aria-pressed') === 'true'
    const list = items().filter(x => (!onlyChanged || v[x.k] !== def[x.k]) && (hit(x.label) || hit(x.sec) || hit(x.k) || x.d.options?.some(hit)))
    const n = changed().length
    $('[data-sum]').textContent = n ? `изменено ${n}` : 'как на холсте'
    only.disabled = !n && !onlyChanged
    const focus = root.activeElement?.closest?.('.chip, .undo, .sh')
    const key = focus && [focus.dataset.k, focus.dataset.v, focus.dataset.sec].join('|')
    const top = body.scrollTop
    const rows = x => {
      const on = v[x.k] !== def[x.k]
      const need = NEEDS[x.k]?.(v)
      const opts = x.d.options ?? []
      const seg = opts.length <= 3 && opts.every(o => o.length <= 12)
      const dim = typeof need === 'string'
      const inline = seg && !dim && opts.join('').length <= 16
      return `<div class="row${inline ? ' inline' : ''}${dim ? ' dim' : ''}">
<div class="rh">${on ? '<span class="dot" aria-hidden="true"></span>' : ''}<span id="l-${esc(x.k)}">${mark(x.label)}</span>${dim ? `<span class="hint">· ${esc(need)}</span>` : ''}${on ? `<button class="undo" data-undo="${esc(x.k)}" data-k="${esc(x.k)}" title="Вернуть «${esc(def[x.k])}»" aria-label="Вернуть «${esc(def[x.k])}»">${I.undo}</button>` : ''}</div>
<div class="opts${seg ? ' seg' : ''}" role="radiogroup" aria-labelledby="l-${esc(x.k)}">${opts
        .map(
          o =>
            `<button class="chip${o === def[x.k] ? ' def' : ''}" role="radio" data-k="${esc(x.k)}" data-v="${esc(o)}" aria-checked="${v[x.k] === o}" tabindex="${v[x.k] === o ? 0 : -1}"${o === def[x.k] ? ' title="Как на холсте"' : ''}>${x.d.editor === 'color' ? `<i style="background:${esc(o)}"></i>` : ''}${mark(o)}</button>`,
        )
        .join('')}</div></div>`
    }
    const groups = Object.entries(Object.groupBy(list, x => x.sec))
    body.innerHTML = groups.length
      ? groups
          .map(([sec, xs]) => {
            const shut = closed.has(sec) && !q
            const c = xs.filter(x => v[x.k] !== def[x.k]).length
            return `<section class="sec"><button class="sh" data-sec="${esc(sec)}" aria-expanded="${!shut}"><b>${mark(sec)}</b>${sec === SHARED ? '<span class="all">весь сайт</span>' : ''}<span class="c">${c ? `изменено ${c}` : ''}</span>${I.chev}</button>
${shut ? '' : `<div class="rows">${xs.map(rows).join('')}</div>`}</section>`
          })
          .join('')
      : `<p class="empty">${q ? 'Ничего не нашлось' : 'Всё как на холсте'}</p>`
    body.scrollTop = top
    if (key) [...root.querySelectorAll('.chip, .undo, .sh')].find(b => [b.dataset.k, b.dataset.v, b.dataset.sec].join('|') === key)?.focus()
  }

  const count = () => {
    const n = changed().length
    $('[data-n]').hidden = !n
    $('[data-n]').textContent = n
  }

  root.addEventListener('click', e => {
    const t = e.target.closest('button')
    if (!t) return
    if (t.dataset.go) go(p + Number(t.dataset.go))
    else if (t.dataset.undo) window.DCLite.reset([t.dataset.undo])
    else if (t.dataset.v !== undefined) window.DCLite.set(t.dataset.k, t.dataset.v)
    else if (t.dataset.sec) {
      const s = t.dataset.sec
      closed.has(s) ? closed.delete(s) : closed.add(s)
      store('demo:closed', JSON.stringify([...closed]))
      draw()
    } else if ('only' in t.dataset) {
      t.setAttribute('aria-pressed', t.getAttribute('aria-pressed') !== 'true')
      draw()
    } else if ('reset' in t.dataset) {
      window.DCLite.reset()
      say('Все настройки как на холсте')
    } else if ('copy' in t.dataset)
      navigator.clipboard.writeText(location.href).then(
        () => say('Ссылка скопирована'),
        () => say('Не удалось скопировать — возьмите адрес из строки браузера'),
      )
    else if ('tune' in t.dataset) open(panel.hidden)
    else if ('close' in t.dataset) open(false)
    else if ('hide' in t.dataset) hide(true)
    else if (t === fab) hide(false)
  })
  // Стрелки внутри группы вариантов переключают значение, как у радиокнопок
  root.addEventListener('keydown', e => {
    const t = e.target
    if (!t.classList?.contains('chip')) return
    const d = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[e.key]
    if (!d) return
    e.preventDefault()
    e.stopPropagation()
    const all = [...t.parentElement.children]
    const b = all[(all.indexOf(t) + d + all.length) % all.length]
    window.DCLite.set(b.dataset.k, b.dataset.v)
    root.querySelector(`.chip[data-k="${CSS.escape(b.dataset.k)}"][data-v="${CSS.escape(b.dataset.v)}"]`)?.focus()
  })
  find.addEventListener('input', draw)
  find.addEventListener('keydown', e => {
    e.stopPropagation()
    if (e.key === 'Escape') find.value ? ((find.value = ''), draw()) : open(false)
  })
  $('[data-page]').addEventListener('change', e => go(Number(e.target.value)))
  addEventListener('dc:change', () => {
    count()
    if (!panel.hidden) draw()
  })
  addEventListener('storage', e => e.key?.startsWith('trix-fr:') && !panel.hidden && draw())
  addEventListener('keydown', e => {
    const t = e.composedPath()[0]
    if (e.ctrlKey || e.metaKey || e.altKey || e.shiftKey || t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName)) return
    const act = {
      ArrowLeft: () => go(p - 1),
      ArrowRight: () => go(p + 1),
      KeyT: () => {
        hide(false)
        open(panel.hidden)
      },
      KeyH: () => hide(!bar.hidden),
      Slash: () => {
        hide(false)
        open(true)
        find.focus()
      },
      Escape: () => open(false),
    }[e.code] ?? (/^Digit[1-9]$/.test(e.code) && Number(e.code.slice(5)) <= pages.length ? () => go(Number(e.code.slice(5)) - 1) : null)
    if (!act) return
    e.preventDefault()
    act()
  })

  document.body.append(el)
  count()
  hide(store('demo:hidden') === '1')
  if (store('demo:panel') && bar.hidden === false) open(true)
  if (!store('demo:hinted')) {
    store('demo:hinted', '1')
    say('<kbd>←</kbd> <kbd>→</kbd> или <kbd>1</kbd>–<kbd>8</kbd> страницы · <kbd>T</kbd> tweaks · <kbd>/</kbd> поиск · <kbd>H</kbd> скрыть', 6000)
  }
})()
