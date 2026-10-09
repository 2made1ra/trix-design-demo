// Эксперименты для досок TRIX × The Verge. VergeFX.run(props, { words }) → stop()
// props: theme, cursor, letters, zone, reveal, display, ticker, rail — значения из Tweaks доски; курсор — через TrixFX (cursor-fx.js)
;(() => {
  const DEF = { theme: 'Светлая', cursor: 'Слова', letters: 'Мелкие', zone: 'Как было', reveal: 'Подъём', display: 'Обычный', ticker: 'Постоянная', rail: 'Рисуется' }
  const ABC = 'АБВГДЕЖЗИКЛМНОПРСТУФХЦЧШЩЭЮЯ'
  const COVERS = ['var(--mint)', 'var(--uv)', 'var(--inv)']
  const TEXT = '.d-hero, .d-1, .d-2, .d-3, .k, .h-34, .h-24'
  const calm = () => matchMedia('(prefers-reduced-motion: reduce)').matches
  const noop = () => {}

  const listen = (t, h, capture = false) => {
    for (const k in h) t.addEventListener(k, h[k], { passive: true, capture })
    return () => { for (const k in h) t.removeEventListener(k, h[k], { capture }) }
  }
  // Холст масштабирует доску — переводим экранные координаты в координаты элемента
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
  const textNodes = el => {
    const out = [], w = document.createTreeWalker(el, NodeFilter.SHOW_TEXT)
    for (let n; (n = w.nextNode());) if (n.data.trim()) out.push(n)
    return out
  }

  // Курсор: буквы и слова по всем пустым зонам страницы, в обход текста и цветных блоков
  const SOLID = '.tile, .ticker, .b, .tag, .pick, .inp, .ribbon, .icon-btn, .nav, .lvl, .opt, .fx-cover'
  // Размер букв следа: кегль и шаг сетки
  const SIZES = { 'Мелкие': [9, 7, 12], 'Средние': [11, 9, 15], 'Крупные': [13, 10, 18] }
  function words(root, key, size) {
    const T = window.TrixTrail
    if (!T) return noop
    const color = root.dataset.theme === 'dark' ? '#3cffd0' : '#5200ff'
    const [font, ...cell] = SIZES[size] ?? SIZES['Мелкие']
    return T.mount('.vg', () => ({ color, glyphs: 'words', words: key, avoid: true, ink: true, font, cell, solid: SOLID, follow: [1100, 760] }))
  }

  // Появление блоков с data-rv: цветная шторка уезжает, текст расшифровывается или поднимается
  function decode(el, delay) {
    let at = 0
    const nodes = textNodes(el).map(n => ({ n, src: n.data, at: (at += n.data.length) - n.data.length }))
    const t0 = performance.now() + delay
    let raf = 0
    const tick = now => {
      let done = true
      for (const o of nodes) {
        o.n.data = [...o.src].map((ch, i) => {
          if (ch === ' ' || now - t0 > (o.at + i) * 28 + 180) return ch
          done = false
          return ABC[Math.random() * ABC.length | 0]
        }).join('')
      }
      raf = done ? 0 : requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => { cancelAnimationFrame(raf); for (const o of nodes) o.n.data = o.src }
  }

  // Блок скрыт, пока не попадёт в видимую область — окна, прокручиваемого контейнера или холста редактора
  function reveal(root, mode) {
    const items = [...root.querySelectorAll('[data-rv]')]
    const undo = []
    const rise = (el, d) => {
      const a = el.animate([{ opacity: 0, transform: 'translateY(48px)' }, { opacity: 1, transform: 'none' }], { duration: 950, delay: d, easing: 'cubic-bezier(.16,.8,.24,1)', fill: 'backwards' })
      undo.push(() => a.cancel())
    }
    const play = new Map(items.map((el, i) => {
      if (mode === 'Шторка') {
        if (getComputedStyle(el).position === 'static') { el.style.position = 'relative'; undo.push(() => { el.style.position = '' }) }
        const c = mk(el, 'fx-cover')
        c.style.background = COVERS[i % COVERS.length]
        undo.push(() => c.remove())
        return [el, d => c.animate([{ transform: 'scaleX(1)' }, { transform: 'scaleX(0)' }], { duration: 760, delay: d, easing: 'cubic-bezier(.7,0,.2,1)', fill: 'forwards' })]
      }
      el.style.opacity = '0'
      undo.push(() => { el.style.opacity = '' })
      return [el, d => {
        el.style.opacity = ''
        rise(el, d)
        if (mode === 'Расшифровка') [el, ...el.querySelectorAll(TEXT)].filter(t => t.matches(TEXT)).forEach(t => undo.push(decode(t, d + 120)))
      }]
    }))
    const show = (el, d) => {
      if (!play.has(el)) return
      io.unobserve(el)
      play.get(el)(d)
      play.delete(el)
    }
    const io = new IntersectionObserver(entries => {
      let i = 0
      for (const e of entries) {
        if (!e.isIntersecting && e.boundingClientRect.bottom >= 0) continue
        // Прыжок по якорю или быстрая прокрутка: всё, что выше показанного блока, проявляем вместе с ним
        items.slice(0, items.indexOf(e.target)).forEach(el => show(el, 0))
        show(e.target, i++ * 90)
      }
    }, { rootMargin: '0px 0px -8% 0px' })
    items.forEach(el => io.observe(el))
    return () => { io.disconnect(); undo.forEach(f => f()) }
  }

  // Крупные заголовки по буквам: «шёпот» — буквы у курсора худеют до 200, «резина» — тянутся вверх
  function display(root, mode) {
    const heads = [...root.querySelectorAll('.d-hero, .d-1')]
    const saved = heads.map(h => h.innerHTML)
    const letters = []
    for (const h of heads) for (const n of textNodes(h)) {
      const frag = document.createDocumentFragment()
      n.data.split(/(\s+)/).forEach(part => {
        if (!part) return
        if (/^\s+$/.test(part)) return frag.append(part)
        const w = document.createElement('span')
        w.className = 'fx-w'
        for (const ch of part) {
          const l = document.createElement('span')
          l.className = 'fx-l'
          l.textContent = ch
          w.append(l)
          letters.push({ l })
        }
        frag.append(w)
      })
      n.replaceWith(frag)
    }
    // Ширина фиксируется по жирному начертанию, чтобы строка не прыгала
    const measure = () => {
      const r = root.getBoundingClientRect(), s = r.width / root.offsetWidth || 1
      for (const o of letters) {
        o.l.style.width = ''
        const b = o.l.getBoundingClientRect()
        o.l.style.width = b.width / s + 'px'
        o.x = (b.left + b.width / 2 - r.left) / s
        o.y = (b.top + b.height / 2 - r.top) / s
      }
    }
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(root)
    let raf = 0, pt = null
    const paint = () => {
      raf = 0
      for (const o of letters) {
        const f = pt ? Math.max(0, 1 - Math.hypot(o.x - pt.x, (o.y - pt.y) * 1.4) / 260) : 0
        if (mode === 'Резина') o.l.style.transform = f ? `scaleY(${1 + f * .42})` : ''
        else o.l.style.fontWeight = String(Math.round(900 - f * 760))
      }
    }
    const off = listen(root, {
      pointermove: e => { pt = local(root, e); raf ||= requestAnimationFrame(paint) },
      pointerleave: () => { pt = null; raf ||= requestAnimationFrame(paint) },
    })
    return () => { off(); ro.disconnect(); cancelAnimationFrame(raf); heads.forEach((h, i) => { h.innerHTML = saved[i] }) }
  }

  // Бегущая строка: колесо и прокрутка разгоняют и наклоняют, вверх — едет обратно
  function ticker(root, mode) {
    const els = [...root.querySelectorAll('.ticker')]
    if (mode === 'Выкл') {
      els.forEach(el => { el.hidden = true })
      return () => els.forEach(el => { el.hidden = false })
    }
    const runs = els.map(el => {
      const tk = el.querySelector('.tk'), base = [...tk.children]
      const clones = []
      for (let n = 0; base.length && n < 12 && tk.scrollWidth < el.offsetWidth * 2.2; n++) base.forEach(c => { const k = c.cloneNode(true); tk.append(k); clones.push(k) })
      return { el, tk, clones, x: 0, half: 0 }
    })
    let boost = 0, dir = 1, last = performance.now(), raf = 0
    const loop = now => {
      const dt = Math.min(64, now - last)
      last = now
      boost *= .92
      for (const r of runs) {
        r.half ||= r.tk.scrollWidth / 2
        r.x -= (60 + boost) * dir * dt / 1000
        if (r.x < -r.half) r.x += r.half
        if (r.x > 0) r.x -= r.half
        r.tk.style.transform = `translateX(${r.x}px) skewX(${-dir * Math.min(14, boost / 60)}deg)`
      }
      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)
    const kick = d => { if (mode !== 'По скроллу' || !d) return; dir = Math.sign(d); boost = Math.min(900, boost + Math.abs(d) * 6) }
    // Прокрутка может идти в окне или во внутреннем контейнере — ловим все scroll на фазе захвата
    const pos = new WeakMap()
    const offs = [
      listen(root, { wheel: e => kick(e.deltaY) }),
      listen(document, { scroll: e => {
        const t = e.target === document ? document.scrollingElement : e.target
        const y = t.scrollTop
        kick(y - (pos.get(t) ?? y))
        pos.set(t, y)
      } }, true),
    ]
    return () => {
      cancelAnimationFrame(raf)
      offs.forEach(f => f())
      runs.forEach(r => { r.clones.forEach(c => c.remove()); r.tk.style.transform = '' })
    }
  }

  // Рельс ленты дорисовывается до последнего показанного пункта (или до курсора), пройденные точки загораются мятой
  function rail(root, mode) {
    if (mode === 'Статичная') return noop
    const runs = [...root.querySelectorAll('.stream')].map(s => ({ s, bar: mk(s, 'fx-rail'), items: [...s.querySelectorAll(':scope > .st')], seen: new Set(), p: 0, t: 0, hover: false }))
    let raf = 0
    const reach = r => Math.max(0, ...[...r.seen].map(it => (it.offsetTop + 24) / r.s.offsetHeight))
    const io = new IntersectionObserver(entries => {
      for (const e of entries) {
        const r = runs.find(r => r.items.includes(e.target))
        if (e.isIntersecting || e.boundingClientRect.bottom < 0) r.seen.add(e.target)
        else r.seen.delete(e.target)
      }
      wake()
    }, { rootMargin: '0px 0px -30% 0px' })
    runs.forEach(r => r.items.forEach(it => io.observe(it)))
    const loop = () => {
      let moving = false
      for (const r of runs) {
        if (!r.hover) r.t = r.seen.size === r.items.length ? 1 : reach(r)
        r.p += (r.t - r.p) * .08
        if (Math.abs(r.t - r.p) > .001) moving = true
        r.bar.style.transform = `scaleY(${r.p})`
        const h = r.s.offsetHeight
        r.items.forEach(it => it.classList.toggle('hit', (it.offsetTop + 22) / h <= r.p + .002))
      }
      raf = moving ? requestAnimationFrame(loop) : 0
    }
    const wake = () => { raf ||= requestAnimationFrame(loop) }
    const offs = runs.map(r => listen(r.s, {
      pointermove: e => { r.hover = true; r.t = Math.min(1, Math.max(0, local(r.s, e).y / r.s.offsetHeight)); wake() },
      pointerleave: () => { r.hover = false; wake() },
    }))
    return () => {
      io.disconnect()
      cancelAnimationFrame(raf)
      offs.forEach(f => f())
      runs.forEach(r => { r.bar.remove(); r.items.forEach(it => it.classList.remove('hit')) })
    }
  }


  window.VergeFX = {
    keys: Object.keys(DEF),
    run(props = {}, { words: key } = {}) {
      const root = document.querySelector('.vg')
      if (!root) return noop
      const p = Object.fromEntries(Object.keys(DEF).map(k => [k, props[k] ?? DEF[k]]))
      root.dataset.theme = p.theme === 'Тёмная' ? 'dark' : 'light'
      if (calm()) return noop
      const stops = [
        p.display !== 'Обычный' && display(root, p.display),
        window.TrixFX?.cursor(root, p, {
          words: key,
          accent: root.dataset.theme === 'dark' ? '#3cffd0' : '#5200ff',
          light: '#3cffd0',
          legacy: () => words(root, key, p.letters),
        }),
        p.reveal !== 'Выкл' && reveal(root, p.reveal),
        ticker(root, p.ticker),
        rail(root, p.rail),
      ].filter(Boolean)
      return () => stops.reverse().forEach(f => f())
    },
  }
})()
