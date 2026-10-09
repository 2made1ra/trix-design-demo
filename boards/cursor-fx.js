// Курсор для всех досок TRIX — режимы с доски The Verge плюс выбор зоны следа. TrixFX.run(props, opts) → stop()
// props (Tweaks): cursor, letters, zone, reveal
// opts: words — ключ слов из TrixTrail, accent/light — цвет следа на светлом и тёмном фоне,
//   legacy(cursor) — эффект доски «как было», spot() — подсветка карточек, defaults — значения Tweaks доски
;(() => {
  const DEF = { cursor: 'Слова', letters: 'Мелкие', zone: 'Как было', reveal: 'Выкл' }
  const SIZES = { 'Мелкие': [9, 7, 12], 'Средние': [11, 9, 15], 'Крупные': [13, 10, 18] }
  // Цветные зоны, которые рисуют фон псевдоэлементом и не видны по computed background
  const ZONE = '.mesh:not(.ava):not(.mesh-sm), .sg-aurora, .hero-bg, .tile, .band, .console'
  const SKIP = 'a, button, input, textarea, select, label, img, svg, canvas, header, nav, x-import, i, b, em, strong, dt, dd, h1, h2, h3, p'
  const CSS = `.fx-lens{position:absolute;z-index:60;left:-70px;top:-70px;width:140px;height:140px;border-radius:50%;pointer-events:none;-webkit-backdrop-filter:invert(1);backdrop-filter:invert(1);box-shadow:0 0 0 1px var(--fx-c);opacity:0;transition:opacity .2s,scale .3s cubic-bezier(.2,.7,.2,1)}
.fx-lens.on{opacity:1}.fx-lens.big{scale:1.6}
.fx-ch,.fx-cv{position:absolute;z-index:60;left:0;top:0;pointer-events:none;background:var(--fx-c);opacity:0;transition:opacity .2s}
.fx-ch{width:100%;height:1px}.fx-cv{width:1px;height:100%}
.fx-ct{position:absolute;z-index:61;left:0;top:0;padding:6px 10px;border-radius:2px;background:var(--fx-c);color:#fff;font:700 10px/1 var(--fx-font,ui-monospace,SFMono-Regular,monospace);letter-spacing:1.4px;text-transform:uppercase;white-space:nowrap;pointer-events:none;opacity:0}
.fx-on .fx-ch,.fx-on .fx-cv,.fx-on .fx-ct{opacity:1}`
  const calm = () => matchMedia('(prefers-reduced-motion: reduce)').matches
  const noop = () => {}
  const chain = (...fs) => () => fs.forEach(f => f?.())

  const listen = (t, h) => {
    for (const k in h) t.addEventListener(k, h[k], { passive: true })
    return () => { for (const k in h) t.removeEventListener(k, h[k]) }
  }
  const local = (el, e) => {
    const r = el.getBoundingClientRect(), s = r.width / el.offsetWidth || 1
    return { x: (e.clientX - r.left) / s, y: (e.clientY - r.top) / s }
  }
  const mk = (root, cls) => {
    const el = document.createElement('i')
    el.className = cls
    el.setAttribute('aria-hidden', 'true')
    root.append(el)
    return el
  }
  const rgba = c => { const [r, g, b, a = 1] = (c.match(/[\d.]+/g) ?? [255, 255, 255]).map(Number); return { a, l: (.2126 * r + .7152 * g + .0722 * b) / 255 } }

  // Блоки со своим фоном или рамкой: заливка, градиент, рамка по контуру или тень со скруглением
  function blocks(root) {
    const base = getComputedStyle(root).backgroundColor
    return [...root.querySelectorAll('*')].filter(el => {
      if (el.matches(ZONE)) return true
      if (el.matches(SKIP) || el.offsetWidth < 140 || el.offsetHeight < 56) return false
      const cs = getComputedStyle(el)
      if (cs.display.startsWith('inline') || cs.position === 'fixed' || cs.position === 'sticky') return false
      if (cs.backgroundImage !== 'none' || (rgba(cs.backgroundColor).a > .5 && cs.backgroundColor !== base)) return true
      const round = parseFloat(cs.borderTopLeftRadius) > 0
      return ['Top', 'Right', 'Bottom', 'Left'].every(s => parseFloat(cs[`border${s}Width`]) > 0) || (round && cs.boxShadow !== 'none')
    })
  }

  // Слова по выбранной зоне: белый фон страницы, фон и все блоки или только карточки (не во всю ширину)
  function words(root, p, o) {
    const T = window.TrixTrail
    if (!T) return noop
    const [font, ...cell] = SIZES[p.letters] ?? SIZES['Мелкие']
    const list = blocks(root)
    list.forEach(el => { el.dataset.fxb = '' })
    const opts = { glyphs: 'words', words: o.words, avoid: true, ink: true, font, cell, self: true, solid: '[data-fxb]' }
    const tone = el => rgba(getComputedStyle(el).color).l > .6 ? o.light : o.accent
    const W = root.offsetWidth
    const targets = p.zone === 'Весь белый фон' ? [] : p.zone === 'Только карточки' ? list.filter(el => el.offsetWidth < W * .92) : list
    const stops = targets.map(el => T.attach(el, { ...opts, color: tone(el), follow: el.offsetHeight > 900 ? [1100, 760] : undefined }))
    if (p.zone !== 'Только карточки') stops.push(T.attach(root, { ...opts, color: o.accent, follow: [1100, 760] }))
    return () => { stops.forEach(f => f()); list.forEach(el => delete el.dataset.fxb) }
  }

  function lens(root) {
    const l = mk(root, 'fx-lens')
    return chain(listen(root, {
      pointermove: e => {
        const { x, y } = local(root, e)
        l.style.translate = `${x}px ${y}px`
        l.classList.add('on')
        l.classList.toggle('big', !!e.target.closest('a, button, label, input, textarea'))
      },
      pointerleave: () => l.classList.remove('on'),
    }), () => l.remove())
  }

  const KIND = [['input, textarea', 'Поле'], ['a, button', 'Действие'], ['label', 'Выбор'], ['h1, h2, h3', 'Заголовок'], ['.tile', 'Плитка'], ['.st', 'Лента']]
  function cross(root) {
    const h = mk(root, 'fx-ch'), v = mk(root, 'fx-cv'), t = mk(root, 'fx-ct')
    const pad = n => String(Math.round(n)).padStart(4, '0')
    return chain(listen(root, {
      pointermove: e => {
        const { x, y } = local(root, e)
        h.style.translate = `0 ${y}px`
        v.style.translate = `${x}px 0`
        const kind = KIND.find(([s]) => e.target.closest(s))?.[1]
        t.textContent = `X ${pad(x)} · Y ${pad(y)}${kind ? ' · ' + kind : ''}`
        t.style.translate = `${Math.min(x + 16, root.offsetWidth - t.offsetWidth - 8)}px ${y + 16}px`
        root.classList.add('fx-on')
      },
      pointerleave: () => root.classList.remove('fx-on'),
    }), () => { h.remove(); v.remove(); t.remove(); root.classList.remove('fx-on') })
  }

  // Блоки с data-rv поднимаются, когда попадают в видимую область окна или холста редактора
  function reveal(root) {
    const items = [...root.querySelectorAll('[data-rv]')]
    const anims = []
    items.forEach(el => { el.style.opacity = '0' })
    const io = new IntersectionObserver(entries => {
      let i = 0
      for (const e of entries) {
        if (!e.isIntersecting && e.boundingClientRect.bottom >= 0) continue
        io.unobserve(e.target)
        e.target.style.opacity = ''
        anims.push(e.target.animate([{ opacity: 0, transform: 'translateY(32px)' }, { opacity: 1, transform: 'none' }], { duration: 850, delay: i++ * 90, easing: 'cubic-bezier(.16,.8,.24,1)', fill: 'backwards' }))
      }
    }, { rootMargin: '0px 0px -8% 0px' })
    items.forEach(el => io.observe(el))
    return () => { io.disconnect(); anims.forEach(a => a.cancel()); items.forEach(el => { el.style.opacity = '' }) }
  }

  // Режим курсора; компоненты дизайн-систем дорисовываются позже, поэтому зоны ищем с задержкой
  function cursor(root, p, o) {
    if (p.cursor === 'Магнитный градиент' || (p.cursor === 'Слова' && p.zone === 'Как было')) return o.legacy?.(p.cursor) ?? noop
    if (p.cursor === 'Линза-негатив') return lens(root)
    if (p.cursor === 'Перекрестие') return cross(root)
    if (p.cursor !== 'Слова') return noop
    let stop = noop
    const t = setTimeout(() => { stop = words(root, p, o) }, 700)
    return () => { clearTimeout(t); stop() }
  }

  window.TrixFX = {
    keys: Object.keys(DEF),
    cursor(root, p, o) {
      if (!document.getElementById('trix-fx')) {
        const s = document.createElement('style')
        s.id = 'trix-fx'
        s.textContent = CSS
        document.head.append(s)
      }
      if (getComputedStyle(root).position === 'static') root.style.position = 'relative'
      root.style.setProperty('--fx-c', o.accent)
      return cursor(root, { ...DEF, ...p }, o)
    },
    run(props = {}, o = {}) {
      const root = document.querySelector('[data-fx]')
      if (!root || calm()) return noop
      const p = Object.fromEntries(Object.keys(DEF).map(k => [k, props[k] ?? o.defaults?.[k] ?? DEF[k]]))
      const stops = [o.spot?.(), this.cursor(root, p, o), p.reveal === 'Подъём' && reveal(root)]
      return () => stops.filter(Boolean).reverse().forEach(f => f())
    },
  }
})()
