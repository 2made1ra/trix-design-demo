// Панель просмотра поверх макета: хаб, переходы по сценарию и вариантам, Tweaks. В Shadow DOM, чтобы стили макета её не задевали
;(() => {
  const { systems, pages, s, p } = JSON.parse(document.getElementById('demo-meta').textContent)
  const total = systems.length * pages.length
  const url = i => `/${systems[Math.floor(i / pages.length)].slug}/${pages[i % pages.length].slug}`
  const at = (si, pi) => si * pages.length + pi
  const here = at(s, p)
  const go = i => location.assign(url((i + total) % total))
  const store = (k, v) => {
    try {
      return v === undefined ? localStorage.getItem(k) : v === null ? localStorage.removeItem(k) : localStorage.setItem(k, v)
    } catch {}
  }
  const LABELS = {
    accent: 'Акцент',
    cover: 'Обложка',
    visitor: 'Кто смотрит',
    theme: 'Тема',
    band: 'Цвет полосы',
    cursor: 'Режим',
    letters: 'Размер букв',
    zone: 'Где работает',
    reveal: 'Блоки',
    display: 'Стиль',
    ticker: 'Режим',
    rail: 'Линия',
  }
  const icon = d => `<svg viewBox="0 0 24 24" aria-hidden="true">${d}</svg>`
  const I = {
    hub: icon('<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>'),
    prev: icon('<path d="m15 6-6 6 6 6"/>'),
    next: icon('<path d="m9 6 6 6-6 6"/>'),
    tune: icon('<path d="M4 7h10M18 7h2M4 17h4M12 17h8"/><circle cx="16" cy="7" r="2"/><circle cx="10" cy="17" r="2"/>'),
    hide: icon('<path d="m6 9 6 6 6-6"/>'),
    show: icon('<path d="m6 15 6-6 6 6"/>'),
    link: icon('<path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1"/>'),
  }
  const esc = v => String(v).replace(/[&<>"]/g, c => `&#${c.charCodeAt(0)};`)
  const opt = (list, cur) => list.map((x, i) => `<option value="${i}"${i === cur ? ' selected' : ''}>${esc(x)}</option>`).join('')

  const el = document.createElement('trix-demo-bar')
  const root = el.attachShadow({ mode: 'open' })
  root.innerHTML = `<style>
:host{all:initial;position:fixed;inset:auto 0 0 0;z-index:2147483000;pointer-events:none;font:500 13px/1.3 system-ui,-apple-system,'Segoe UI',Roboto,sans-serif;color:#f4f4f5;-webkit-font-smoothing:antialiased}
*{box-sizing:border-box}
[hidden]{display:none!important}
svg{width:18px;height:18px;fill:none;stroke:currentColor;stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round;flex:none}
.wrap{display:flex;flex-direction:column;align-items:center;gap:10px;padding:0 12px 16px}
.bar,.fab,.panel,.toast{pointer-events:auto;background:rgba(18,18,22,.9);-webkit-backdrop-filter:blur(14px) saturate(1.4);backdrop-filter:blur(14px) saturate(1.4);border:1px solid rgba(255,255,255,.1);box-shadow:0 12px 40px rgba(0,0,0,.28),0 2px 6px rgba(0,0,0,.2)}
.bar{display:flex;align-items:center;gap:4px;max-width:100%;padding:5px;border-radius:14px}
.btn{display:inline-flex;align-items:center;justify-content:center;gap:7px;height:36px;min-width:36px;padding:0 10px;border:0;border-radius:9px;background:none;color:inherit;font:inherit;text-decoration:none;cursor:pointer;white-space:nowrap}
.btn:hover{background:rgba(255,255,255,.1)}
.btn[aria-expanded=true]{background:#f4f4f5;color:#111}
.btn:focus-visible,select:focus-visible,.chip:focus-visible{outline:2px solid #8ab4ff;outline-offset:1px}
.sep{width:1px;height:20px;margin:0 4px;background:rgba(255,255,255,.14);flex:none}
.pick{position:relative;display:flex;min-width:0}
select{appearance:none;height:36px;min-width:0;max-width:220px;padding:0 26px 0 10px;border:0;border-radius:9px;background:rgba(255,255,255,.07) url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23a1a1aa' stroke-width='2' stroke-linecap='round'%3E%3Cpath d='m7 10 5 5 5-5'/%3E%3C/svg%3E") right 6px center/16px no-repeat;color:inherit;font:inherit;text-overflow:ellipsis;cursor:pointer}
select:hover{background-color:rgba(255,255,255,.13)}
option{color:#111;background:#fff}
.sys{font-weight:650}
.count{padding:0 4px;color:#a1a1aa;font-variant-numeric:tabular-nums}
.sr{position:absolute;width:1px;height:1px;overflow:hidden;clip-path:inset(50%)}
.fab{position:fixed;right:16px;bottom:16px;display:grid;place-items:center;width:44px;height:44px;border-radius:12px;color:inherit;cursor:pointer}
.panel{width:min(420px,100%);max-height:min(70vh,640px);overflow:auto;border-radius:16px;padding:6px 18px 16px;overscroll-behavior:contain}
.head{position:sticky;top:-6px;display:flex;align-items:center;justify-content:space-between;gap:12px;margin:0 -18px;padding:12px 18px 10px;background:rgba(18,18,22,.96)}
.head b{font-size:14px}
.head div{display:flex;gap:4px}
.small{height:30px;padding:0 10px;font-size:12px;color:#d4d4d8;background:rgba(255,255,255,.07)}
.sec{margin-top:14px}
.sec h3{margin:0 0 8px;font-size:11px;font-weight:600;letter-spacing:.08em;text-transform:uppercase;color:#a1a1aa}
.row{display:grid;gap:6px;margin-bottom:10px}
.row>span{font-size:12px;color:#d4d4d8}
.opts{display:flex;flex-wrap:wrap;gap:6px}
.chip{display:inline-flex;align-items:center;gap:6px;min-height:32px;padding:6px 11px;border:1px solid rgba(255,255,255,.14);border-radius:8px;background:none;color:#e4e4e7;font:inherit;font-size:12.5px;cursor:pointer}
.chip:hover{border-color:rgba(255,255,255,.4)}
.chip[aria-pressed=true]{background:#f4f4f5;border-color:#f4f4f5;color:#111}
.chip i{width:14px;height:14px;border-radius:4px;box-shadow:inset 0 0 0 1px rgba(255,255,255,.3)}
.note{margin:14px 0 0;font-size:12px;line-height:1.45;color:#a1a1aa}
.toast{padding:9px 14px;border-radius:10px;font-size:12.5px;color:#e4e4e7}
kbd{display:inline-block;min-width:20px;padding:1px 5px;border-radius:5px;background:rgba(255,255,255,.12);font:600 11px/1.5 ui-monospace,monospace;text-align:center}
@media (max-width:720px){.lbl,.count,.sep.opt{display:none}select{max-width:30vw}.wrap{padding:0 8px 10px}}
@media (max-width:420px){.page{display:none}}
@media print{:host{display:none}}
</style>
<div class="wrap">
<div class="toast" hidden></div>
<section class="panel" hidden role="dialog" aria-label="Настройки страницы"></section>
<nav class="bar" aria-label="Просмотр макетов">
<a class="btn" href="/" title="Все варианты">${I.hub}<span class="lbl">Хаб</span></a>
<span class="sep"></span>
<button class="btn" data-go="-1" title="Предыдущая страница (←)" aria-label="Предыдущая страница">${I.prev}</button>
<label class="pick"><span class="sr">Вариант дизайна</span><select class="sys" data-sys>${opt(systems.map(x => x.name), s)}</select></label>
<label class="pick page"><span class="sr">Страница</span><select data-page>${opt(pages.map((x, i) => `${i + 1}. ${x.name}`), p)}</select></label>
<span class="count">${p + 1}/${pages.length}</span>
<button class="btn" data-go="1" title="Следующая страница (→)" aria-label="Следующая страница">${I.next}</button>
<span class="sep opt"></span>
<button class="btn" data-tune aria-expanded="false" title="Настройки страницы (T)">${I.tune}<span class="lbl">Настройки</span></button>
<button class="btn" data-hide title="Скрыть панель (H)" aria-label="Скрыть панель">${I.hide}</button>
</nav>
</div>
<button class="fab" hidden title="Показать панель (H)" aria-label="Показать панель">${I.show}</button>`

  const $ = q => root.querySelector(q)
  const bar = $('.wrap')
  const fab = $('.fab')
  const panel = $('.panel')
  const tune = $('[data-tune]')
  const toast = $('.toast')
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
    store('demo:hidden', on ? '1' : null)
  }
  const open = on => {
    panel.hidden = !on
    tune.setAttribute('aria-expanded', on)
    if (on) draw()
  }

  function draw() {
    const { schema, values } = window.DCLite
    const v = values()
    const groups = Object.groupBy(Object.entries(schema).filter(([, d]) => d.editor), ([, d]) => d.section ?? 'Прочее')
    panel.innerHTML = `<div class="head"><b>Настройки страницы</b><div>
<button class="btn small" data-copy title="Ссылка с текущими настройками">${I.link}Ссылка</button>
<button class="btn small" data-reset>Сбросить</button></div></div>
${Object.entries(groups)
  .map(
    ([sec, items]) => `<div class="sec"><h3>${esc(sec)}</h3>${items
      .map(
        ([k, d]) => `<div class="row">${items.length > 1 || !LABELS[k] ? `<span>${esc(LABELS[k] ?? k)}</span>` : ''}<div class="opts" role="group" aria-label="${esc(LABELS[k] ?? k)}">${(d.options ?? [])
          .map(
            o => `<button class="chip" data-k="${esc(k)}" data-v="${esc(o)}" aria-pressed="${v[k] === o}">${d.editor === 'color' ? `<i style="background:${esc(o)}"></i>` : ''}${esc(o)}</button>`,
          )
          .join('')}</div></div>`,
      )
      .join('')}</div>`,
  )
  .join('')}
<p class="note">Настройки запоминаются для этой страницы в браузере и попадают в адрес — ссылкой можно поделиться.</p>`
  }

  root.addEventListener('click', e => {
    const t = e.target.closest('button')
    if (!t) return
    if (t.dataset.go) go(here + Number(t.dataset.go))
    else if (t.dataset.k) window.DCLite.set(t.dataset.k, t.dataset.v)
    else if ('reset' in t.dataset) window.DCLite.reset()
    else if ('copy' in t.dataset)
      navigator.clipboard.writeText(location.href).then(
        () => say('Ссылка скопирована'),
        () => say('Не удалось скопировать — возьмите адрес из строки браузера'),
      )
    else if ('tune' in t.dataset) open(panel.hidden)
    else if ('hide' in t.dataset) {
      open(false)
      hide(true)
    } else if (t === fab) hide(false)
  })
  root.addEventListener('change', e => {
    const sel = e.target
    if ('sys' in sel.dataset) go(at(Number(sel.value), p))
    if ('page' in sel.dataset) go(at(s, Number(sel.value)))
  })
  addEventListener('dc:change', () => !panel.hidden && draw())
  addEventListener('keydown', e => {
    const t = e.composedPath()[0]
    if (e.ctrlKey || e.metaKey || e.altKey || t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName)) return
    const key = e.shiftKey ? `Shift+${e.code}` : e.code
    const act = {
      ArrowLeft: () => go(here - 1),
      ArrowRight: () => go(here + 1),
      'Shift+ArrowUp': () => go(at((s - 1 + systems.length) % systems.length, p)),
      'Shift+ArrowDown': () => go(at((s + 1) % systems.length, p)),
      KeyT: () => {
        hide(false)
        open(panel.hidden)
      },
      KeyH: () => {
        open(false)
        hide(!bar.hidden)
      },
      Escape: () => open(false),
    }[key] ?? (/^Digit[1-9]$/.test(e.code) && !e.shiftKey && Number(e.code.slice(5)) <= systems.length ? () => go(at(Number(e.code.slice(5)) - 1, p)) : null)
    if (!act) return
    e.preventDefault()
    act()
  })

  document.body.append(el)
  hide(store('demo:hidden') === '1')
  if (!store('demo:hinted')) {
    store('demo:hinted', '1')
    say('<kbd>←</kbd> <kbd>→</kbd> страницы · <kbd>⇧</kbd><kbd>↑</kbd><kbd>↓</kbd> варианты · <kbd>T</kbd> настройки · <kbd>H</kbd> скрыть', 6000)
  }
})()
