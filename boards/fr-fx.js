// Эффекты досок TRIX × Франкенштейн. FrankFX.run(props, { words, master }) → stop()
// Палитра и след курсора свои, появление, заголовки, бегущая строка и лента — из VergeFX (verge-fx.js).
// В props приходят только изменённые Tweaks, остальное берём из default в data-props доски.
// Палитру, футер и настройки Verge Glow задаёт главная (master) через localStorage.
;(() => {
  const DEF = {
    palette: 'Тёплая', cursor: 'Слова и буквы', zone: 'Вся страница', text: 'Блоками', fade: 'Мягкое',
    letters: 'Мелкие', spread: 'Обычный', freq: 'Обычно', tone: 'Яркий',
    reveal: 'Подъём', display: 'Обычный', ticker: 'Постоянная', rail: 'Рисуется', footer: 'Подписка + вордмарк',
    glowTiles: 'Вкл', glowButtons: 'Вкл', glowTicker: 'Вкл', glowPage: 'Вкл', glowMotion: 'Дрейф', glowFooterEdge: 'Блик и тень', glowSideEdge: 'Блик и тень',
    heroMotion: 'Выкл', heroColor: 'Авто по палитре', heroGlow: 'Выкл', glowAccent: 'Мятный glow', cards: 'Чередование', card04: 'Лайм', cardMotion: 'Сценарий', cardSide: 'Чередование',
  }
  const SIZES = { 'Мелкие': [9, 7, 12], 'Средние': [11, 9, 15], 'Крупные': [13, 10, 18], 'Огромные': [18, 14, 24] }
  const GLYPHS = { 'Слова и буквы': 'words', 'Только буквы': 'letters', 'Волна': 'wave' }
  const FADE = { 'Выкл': 0, 'Мягкое': 140, 'Сильное': 280 }
  const RATE = { 'Часто': 140, 'Обычно': 260, 'Редко': 560 }
  const SPREAD = { 'Узкий': .6, 'Обычный': 1, 'Широкий': 1.6 }
  // Крупные цветные и градиентные блоки, по которым идёт след; мелкие элементы — препятствия
  const ZONE = '.tile:not(.slate):not(.white), .glow, .ev-cover, .beta'
  const SOLID = '.tile, .ticker, .b, .tag, .pick, .inp, .ribbon, .icon-btn, .nav, .lvl, .opt, .mrow, .fx-cover, [data-fxb]'
  const CARDS = '.tile:not(.glow), .lvl, .ev-card, .ev-steps li'
  // Общие для всех страниц настройки: задаёт главная (master), остальные доски читают и ловят 'storage'
  const SHARED = Object.fromEntries(['palette', 'footer', 'glowTiles', 'glowButtons', 'glowTicker', 'glowPage', 'glowMotion', 'glowFooterEdge'].map(k => [k, `trix-fr:${k}`]))
  const PALETTE = { 'Строгая': 'strict', 'Verge': 'verge', 'Verge Glow': 'glow' }
  const GLOW = { tiles: 'glowTiles', ui: 'glowButtons', ticker: 'glowTicker', bg: 'glowPage' }
  const MOTION = { 'Дрейф': 'drift', 'Курсор': 'cursor' }
  const FOOT = { 'Тёмный финал': 'dark', 'Светлый': 'light', 'Glow': 'glow' }
  // Заголовок главной → data-h-move, data-h-color, data-h-glow
  const HERO = {
    hMove: ['heroMotion', { 'Волна': 'wave', 'Перелив': 'shine', 'Маркер': 'marker', 'Ротатор': 'rotate', 'Печать': 'type' }],
    hColor: ['heroColor', { 'Акцент слова': 'word', 'Плашка': 'plate', 'Монохром': 'mono', 'Слова цветами': 'words' }],
    hGlow: ['heroGlow', { 'Заливка': 'fill', 'Ореол': 'halo', 'Плашка': 'plate', 'У курсора': 'cursor' }],
  }
  // Акцент Verge Glow для заголовка и бегущей строки главной → data-g-accent
  const ACCENT = { 'Мятный glow': 'mint', 'Изумруд': 'emerald' }
  // Карточки блоков главной: цвет-класс плиты [data-card] по варианту, остальные — как в разметке
  const TILE = { how: 'slate', sel: 'ink', rev: 'yellow', gr: 'uv', new: 'mint', org: 'ink' }
  const TILES = {
    'Чередование': { rev: 'mint', gr: 'ink' },
    'Стекло': Object.fromEntries(Object.keys(TILE).map(k => [k, 'glass'])),
    'Мята и дымка': { rev: 'mint' },
  }
  const CM = { 'Появление': 'rise', 'Выкл': 'off' }
  const ROTATE = ['выступить.', 'рассказать.', 'преподать.']
  const noop = () => {}
  const store = (key, v) => { try { return v === undefined ? localStorage.getItem(key) : localStorage.setItem(key, v) } catch { return null } }
  const boardDefaults = () => {
    const tag = document.querySelector('script[data-dc-script]')
    try { return Object.fromEntries(Object.entries(JSON.parse(tag.getAttribute('data-props'))).filter(([, d]) => d?.default).map(([k, d]) => [k, d.default])) } catch { return {} }
  }
  const rgb = c => c.match(/[\d.]+/g).slice(0, 3).map(Number)
  const lum = c => { const [r, g, b] = rgb(c); return .2126 * r + .7152 * g + .0722 * b }
  const light = el => lum(getComputedStyle(el).color) > 150
  const hex = v => v.match(/\w\w/g).map(h => parseInt(h, 16)).join()

  // Подсветка карточки в точке курсора: на белых — акцент палитры, на тёмных — яркий акцент, на цветных — цвет текста
  function spot(root) {
    const T = window.TrixTrail
    if (!T?.spot) return noop
    const css = getComputedStyle(root)
    const stop = T.spot(CARDS, hex(css.getPropertyValue('--trail').trim()))
    root.querySelectorAll('[data-spot]').forEach(el => {
      const cs = getComputedStyle(el)
      if (light(el)) el.style.setProperty('--spot-rgb', hex(css.getPropertyValue('--l-mint').trim()))
      else if (lum(cs.backgroundColor) < 236) el.style.setProperty('--spot-rgb', rgb(cs.color).join())
    })
    return stop
  }

  // Verge Glow, режим «Курсор»: пятна блока под курсором (и всех его glow-предков) тянутся за ним, фон страницы — за курсором по окну
  const GLOWS = '.tile, .b-mint, .b-ink, .tag, .ava, .ticker, .ribbon, .glow, .hero h1, .hero h1 em'
  function glow(root) {
    if (root.dataset.palette !== 'glow' || root.dataset.gmove !== 'cursor') return noop
    let lit = new Set()
    const unset = el => ['--gx', '--gy'].forEach(v => el.style.removeProperty(v))
    const move = e => {
      root.style.setProperty('--px', (e.clientX / innerWidth * 2 - 1).toFixed(3))
      root.style.setProperty('--py', (e.clientY / innerHeight * 2 - 1).toFixed(3))
      const next = new Set()
      for (let el = e.target.closest?.(GLOWS); el && root.contains(el); el = el.parentElement?.closest(GLOWS)) {
        const r = el.getBoundingClientRect()
        el.style.setProperty('--gx', ((e.clientX - r.left) / r.width * 2 - 1).toFixed(3))
        el.style.setProperty('--gy', ((e.clientY - r.top) / r.height * 2 - 1).toFixed(3))
        next.add(el)
      }
      lit.forEach(el => next.has(el) || unset(el))
      lit = next
    }
    const leave = () => { lit.forEach(unset); lit = new Set() }
    root.addEventListener('pointermove', move)
    root.addEventListener('pointerleave', leave)
    return () => {
      root.removeEventListener('pointermove', move)
      root.removeEventListener('pointerleave', leave)
      leave()
      root.style.removeProperty('--px')
      root.style.removeProperty('--py')
    }
  }

  // Заголовок главной: буквы .hl для волны, печати и свечения у курсора, смена слова в ротаторе
  function hero(root) {
    const h = root.querySelector('.hero h1')
    const { hMove: move } = root.dataset
    const lit = root.dataset.palette === 'glow' && root.dataset.hGlow === 'cursor'
    const calm = matchMedia('(prefers-reduced-motion: reduce)').matches
    if (!h || calm && !lit || !lit && !['wave', 'rotate', 'type'].includes(move)) return noop
    const html = h.innerHTML
    let n = 0, tid = 0, raf = 0, pt = null
    const split = el => {
      const w = document.createTreeWalker(el, NodeFilter.SHOW_TEXT), texts = []
      while (w.nextNode()) texts.push(w.currentNode)
      for (const t of texts) t.replaceWith(...[...t.data].map(ch => {
        if (/\s/.test(ch)) return ch
        const l = document.createElement('span')
        l.className = 'hl'
        l.textContent = ch
        l.style.setProperty('--i', n++)
        return l
      }))
    }
    if (lit || move !== 'rotate') split(h)
    // Печать: вторая строка по очереди печатает варианты из data-type (через «|»), последнее слово — акцентное
    if (move === 'type' && !calm) {
      const em = h.querySelector('em')
      const lines = em.dataset.type?.split('|').map(t => t.trim()).filter(Boolean) ?? []
      const caret = document.createElement('i')
      caret.className = 'h-caret'
      let ls = [...em.querySelectorAll('.hl')], v = 0, k = 0, dir = 1
      const load = () => {
        const t = lines[v = (v + 1) % lines.length], i = t.lastIndexOf(' ')
        const part = (cls, text) => Object.assign(document.createElement('span'), { className: cls, textContent: text })
        em.replaceChildren(part('h-w2', t.slice(0, i)), ' ', part('h-key', t.slice(i + 1)))
        split(em)
        ls = [...em.querySelectorAll('.hl')]
      }
      if (lines.length > 1) h.setAttribute('aria-label', h.textContent)
      const at = k => { ls.forEach((l, j) => l.classList.toggle('hl-off', j >= k)); k ? ls[k - 1].after(caret) : ls[0].before(caret) }
      const step = () => {
        at(k += dir)
        if (k === ls.length) dir = -1
        else if (!k) {
          dir = 1
          if (lines.length > 1) { load(); at(0) }
        }
        tid = setTimeout(step, k === ls.length ? 5200 : !k ? 700 : dir > 0 ? 80 : 32)
      }
      at(0)
      tid = setTimeout(step, 900)
    }
    if (move === 'rotate' && !calm) {
      const w = h.querySelector('.h-w1')
      h.setAttribute('aria-label', h.textContent)
      let r = 0
      const swap = () => {
        const out = w.animate([{ transform: 'none', opacity: 1 }, { transform: 'translateY(-.35em)', opacity: 0 }], { duration: 280, easing: 'cubic-bezier(.5,0,.75,0)', fill: 'forwards' })
        tid = setTimeout(() => {
          w.textContent = ROTATE[r = (r + 1) % ROTATE.length]
          if (lit) split(w)
          out.cancel()
          w.animate([{ transform: 'translateY(.35em)', opacity: 0 }, { transform: 'none', opacity: 1 }], { duration: 420, easing: 'cubic-bezier(.16,.8,.24,1)' })
          tid = setTimeout(swap, 3000)
        }, 280)
      }
      tid = setTimeout(swap, 2600)
    }
    const sec = h.closest('.hero')
    const paint = () => {
      raf = 0
      for (const l of h.querySelectorAll('.hl')) {
        const b = l.getBoundingClientRect()
        const f = pt ? Math.max(0, 1 - Math.hypot(b.left + b.width / 2 - pt.x, (b.top + b.height / 2 - pt.y) * 1.3) / 240) : 0
        l.style.setProperty('--hl', f.toFixed(2))
      }
    }
    const hover = e => { pt = e.type === 'pointerleave' ? null : { x: e.clientX, y: e.clientY }; raf ||= requestAnimationFrame(paint) }
    if (lit) for (const t of ['pointermove', 'pointerleave']) sec.addEventListener(t, hover)
    return () => {
      clearTimeout(tid)
      cancelAnimationFrame(raf)
      for (const t of ['pointermove', 'pointerleave']) sec.removeEventListener(t, hover)
      h.innerHTML = html
      h.removeAttribute('aria-label')
    }
  }

  // Сценарии демо-карточек главной: [data-scene="паузы перед каждым следующим шагом, мс"], последняя — на финальном шаге.
  // Пока карточка на экране, шаги идут по кругу: data-s="a" или "a-b" — виден на шагах a…b, data-press — нажат с шага,
  // data-x — убран с шага, data-typed и data-count — печатает текст и считает таймер mm:ss на своём шаге.
  // Без сценария (Tweak «Анимация карточек» или prefers-reduced-motion) карточка сразу показывает финальный шаг
  function scenes(root) {
    let live = root.dataset.cm === 'scene' && !matchMedia('(prefers-reduced-motion: reduce)').matches
    const stops = [...root.querySelectorAll('[data-scene]')].map(sc => {
      const waits = sc.dataset.scene.split(',').map(Number), last = waits.length - 1
      const all = a => [...sc.querySelectorAll(`[${a}]`)]
      const [shown, pressed, cut, text] = ['data-s', 'data-press', 'data-x', 'data-typed], [data-count'].map(all)
      for (const el of text) el.dataset.text ??= el.textContent
      const fill = (el, t) => {
        const v = el.dataset.text
        if ('typed' in el.dataset) return (el.textContent = v.slice(0, Math.round(v.length * t)))
        const [m, c] = v.split(':').map(Number), n = Math.round((m * 60 + c) * t)
        el.textContent = `${String(n / 60 | 0).padStart(2, '0')}:${String(n % 60).padStart(2, '0')}`
      }
      let k = 0, tid = 0
      const rafs = []
      const tween = (el, ms) => {
        const t0 = performance.now()
        const tick = now => { const t = Math.min(1, (now - t0) / ms); fill(el, t); if (t < 1) rafs.push(requestAnimationFrame(tick)) }
        tick(t0)
      }
      const set = n => {
        k = n
        if (!k) rafs.splice(0).forEach(cancelAnimationFrame)
        for (const el of shown) { const [a, b = Infinity] = el.dataset.s.split('-').map(Number); el.classList.toggle('on', k >= a && k <= b) }
        for (const el of pressed) el.setAttribute('aria-pressed', k >= +el.dataset.press)
        for (const el of cut) el.classList.toggle('x', k >= +el.dataset.x)
        for (const el of text) {
          const a = +(el.dataset.typed || el.dataset.count)
          if (k < a || !live) fill(el, k < a ? 0 : 1)
          else if (k === a) tween(el, 'typed' in el.dataset ? el.dataset.text.length * 38 : 1600)
        }
      }
      sc.classList.add('sc')
      if (!live) return set(last), noop
      const run = () => { tid = setTimeout(() => { set(k === last ? 0 : k + 1); run() }, waits[k]) }
      const io = new IntersectionObserver(([e]) => { clearTimeout(tid); if (e.isIntersecting) run(); else set(0) }, { threshold: .35 })
      set(0)
      io.observe(sc)
      return () => { clearTimeout(tid); io.disconnect(); rafs.splice(0).forEach(cancelAnimationFrame); set(last) }
    })
    return () => { live = false; stops.forEach(f => f()) }
  }

  function trail(root, p, o) {
    const T = window.TrixTrail
    if (!T || !GLYPHS[p.cursor]) return noop
    const [font, ...cell] = SIZES[p.letters] ?? SIZES['Мелкие']
    const css = getComputedStyle(root)
    const opts = {
      glyphs: GLYPHS[p.cursor], words: o.words, font, cell, self: true,
      avoid: p.text !== 'Не обходить', ink: p.text === 'По буквам', dense: p.text === 'Блоками',
      fade: FADE[p.fade] ?? 0, rate: RATE[p.freq] ?? 260, spread: SPREAD[p.spread] ?? 1, alpha: p.tone === 'Приглушённый' ? .45 : 1,
    }
    const all = p.zone === 'Белый фон' ? [] : [...root.querySelectorAll(ZONE)].filter(el => el.offsetWidth >= 280 && el.offsetHeight >= 160)
    const blocks = all.filter(el => !all.some(b => b !== el && b.contains(el)))
    blocks.forEach(el => { el.dataset.fxb = '' })
    const stops = blocks.map(el => T.attach(el, {
      ...opts, solid: SOLID.replace(', [data-fxb]', ''),
      color: light(el) ? css.getPropertyValue('--l-mint').trim() : el.matches('.uv') ? getComputedStyle(el).color : css.getPropertyValue('--trail').trim(),
      follow: el.offsetHeight > 900 ? [1100, 760] : undefined,
    }))
    if (p.zone !== 'Цветные блоки') stops.push(T.attach(root, { ...opts, solid: SOLID, color: css.getPropertyValue('--trail').trim(), follow: [1100, 760] }))
    return () => { stops.forEach(f => f()); blocks.forEach(el => delete el.dataset.fxb) }
  }

  window.FrankFX = {
    keys: Object.keys(DEF),
    run(props = {}, o = {}) {
      const root = document.querySelector('.vg')
      if (!root) return noop
      const p = { ...DEF, ...boardDefaults(), ...props }
      for (const [k, key] of Object.entries(SHARED)) {
        if (o.master) store(key, p[k])
        else p[k] = store(key) ?? DEF[k]
      }
      const paint = () => {
        root.dataset.palette = PALETTE[p.palette] ?? 'warm'
        for (const [k, key] of Object.entries(GLOW)) root.toggleAttribute(`data-g-${k}`, p[key] !== 'Выкл')
        root.dataset.gmove = MOTION[p.glowMotion] ?? 'off'
        const edge = v => (v === 'Блик, контур и тень' ? 'ring' : 'soft')
        root.dataset.gEdge = edge(p.glowFooterEdge)
        root.dataset.gSide = edge(p.glowSideEdge)
        root.dataset.gAccent = ACCENT[p.glowAccent] ?? 'blue'
        root.dataset.cm = CM[p.cardMotion] ?? 'scene'
        root.dataset.side = p.cardSide === 'Текст слева' ? 'left' : 'alt'
        for (const [k, [key, map]] of Object.entries(HERO)) root.dataset[k] = map[p[key]] ?? 'off'
        const foot = (root.dataset.foot = FOOT[p.footer] ?? 'strip')
        const mark = (sel, cls) => root.querySelectorAll(sel).forEach(el => Object.entries(cls).forEach(([c, on]) => el.classList.toggle(c, on)))
        mark('[data-ff]', { tile: foot === 'dark', ink: foot === 'dark', glow: foot === 'glow' })
        // В «Мята и дымка» цвет 04 — свой Tweak «Карточка 04»
        const tiles = { ...TILES[p.cards], ...p.cards === 'Мята и дымка' && { gr: p.card04 === 'Мятная дымка' ? 'haze' : 'lime' } }
        root.querySelectorAll('[data-card]').forEach(el => {
          const c = tiles[el.dataset.card] ?? TILE[el.dataset.card]
          for (const v of new Set(Object.values(TILE).concat('glass', 'haze', 'lime'))) el.classList.toggle(v, v === c)
        })
        mark('[data-ffs]', { tile: foot === 'strip', uv: foot === 'strip' })
      }
      paint()
      // До VergeFX: «Шёпот» и «Резина» режут на буквы уже наши .hl, а при остановке возвращают их разметку
      const stopHero = o.master ? hero(root) : noop
      const stopScenes = o.master ? scenes(root) : noop
      const stopVerge = window.VergeFX?.run({ ...p, theme: 'Светлая', cursor: 'Выкл' }, { words: o.words }) ?? noop
      if (matchMedia('(prefers-reduced-motion: reduce)').matches) return () => { stopVerge(); stopHero(); stopScenes() }
      // Раскладка и шрифты должны устояться, прежде чем мерить блоки
      let stop = noop
      const fx = () => { const stops = [trail(root, p, o), spot(root), glow(root)]; return () => stops.forEach(f => f()) }
      const t = setTimeout(() => { stop = fx() }, 400)
      // Цвета следа и подсветки читаются при подключении — после смены палитры подключаем заново
      const sync = e => {
        const k = Object.keys(SHARED).find(k => SHARED[k] === e.key)
        if (o.master || !k || !e.newValue) return
        p[k] = e.newValue
        paint()
        stop()
        stop = fx()
      }
      addEventListener('storage', sync)
      return () => { clearTimeout(t); removeEventListener('storage', sync); stop(); stopVerge(); stopHero(); stopScenes() }
    },
  }
})()
