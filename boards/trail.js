// Эффекты курсора для досок TRIX.
// TrixTrail.mount(selector, el => ({ color, height, glyphs: 'wave' | 'letters' | 'words', words: 'landing' | 'review' | …, avoid })) → stop()
//   avoid: true — символы не рисуются поверх текста, иконок и полей внутри зоны
//   solid: селектор блоков, которые тоже обходятся целиком (плитки, кнопки)
//   follow: [w, h] — холст фиксированного размера ездит за курсором: эффект на всю страницу без гигантского холста
//   ink: true — текст обходится по контуру каждого глифа, след просачивается между буквами и строками
//   self: true — курсор слушается только на самом элементе, а не на ближайшем [data-trail-host]
//   font, cell: [w, h] — размер букв следа и шаг их сетки (по умолчанию 12px и 10×18, при ink — 9px и 7×12)
// TrixTrail.attach(el, opts) — то же для одного элемента
// TrixTrail.magnet(selector, colors) — пятна градиента тянутся за курсором
// TrixTrail.spot(selector, rgb) — подсветка карточки в точке курсора, rgb — цвет акцента системы ('83,58,253')
;(() => {
  const CW = 10, CH = 18, LIFE = 1100
  const ABC = 'АБВГДЕЖЗИКЛМНОПРСТУФХЦЧШЩЭЮЯабвгдежзиклмнопрстуфхцчшщэюя'
  // Слова по смыслу экрана: доска передаёт ключ в opts.words
  const SCREENS = {
    landing: ['НАДЁЖНОСТЬ', 'ИНЦИДЕНТ', 'ПОСТМОРТЕМ', 'МИГРАЦИЯ', 'ОТКАТ', 'МЕТРИКИ', 'ТРЕЙСЫ', 'ПРОДАКШЕН', 'АПТАЙМ',
      'ДЕГРАДАЦИЯ', 'ДЕЖУРСТВО', 'РЕЛИЗ', 'КАНАРЕЙКА', 'АЛЕРТ', 'ЛОГИ', 'КЛАСТЕР', 'РЕЗЕРВ', 'ОТКАЗ', 'ЗАДЕРЖКА',
      'ХАОС', 'НАГРУЗКА', 'ДОКЛАД', 'СЦЕНА', 'ТРЕК'],
    home: ['ДОКЛАД', 'СЦЕНА', 'СПИКЕР', 'МЕРОПРИЯТИЕ', 'ПОДБОРКА', 'РАЗБОР', 'ДЕДЛАЙН', 'ЗАЯВКА', 'АУДИТОРИЯ', 'СЛАЙДЫ',
      'ТАЙМИНГ', 'ПРОГРЕСС', 'РЕЙТИНГ', 'МИТАП', 'КОНФЕРЕНЦИЯ', 'ОРГАНИЗАТОР', 'ПРОФИЛЬ', 'ВЫСТУПЛЕНИЕ', 'ЗАЛ', 'МИКРОФОН'],
    onboarding: ['СФЕРА', 'УРОВЕНЬ', 'БЭКЕНД', 'ФРОНТЕНД', 'МОБАЙЛ', 'ДАННЫЕ', 'ДЕВОПС', 'ТЕСТИРОВАНИЕ', 'ДИЗАЙН',
      'АНАЛИТИКА', 'ДЖУН', 'МИДЛ', 'СЕНЬОР', 'ЛИД', 'ОПЫТ', 'СТЕК', 'НАВЫКИ', 'ПРОФИЛЬ', 'СТАРТ', 'ИНТЕРЕСЫ'],
    selection: ['МИТАП', 'КОНФЕРЕНЦИЯ', 'ФЕСТИВАЛЬ', 'ХАКАТОН', 'ВОРКШОП', 'СЕКЦИЯ', 'ПРОГРАММА', 'ДЕДЛАЙН', 'ЗАЯВКА',
      'ТРЕК', 'ФОРМАТ', 'ОНЛАЙН', 'ОФЛАЙН', 'ГОРОД', 'ДАТА', 'ПОДБОРКА', 'ПРИГЛАШЕНИЕ', 'СЦЕНА', 'БЛИЦ', 'АУДИТОРИЯ'],
    review: ['РАЗБОР', 'ОТЗЫВЫ', 'ОЦЕНКА', 'ВОПРОСЫ', 'ТАЙМИНГ', 'ПОДАЧА', 'СТРУКТУРА', 'СЛАЙДЫ', 'ДИКЦИЯ', 'ПАУЗЫ',
      'ТЕМП', 'КОНТАКТ', 'ЗАЛ', 'АПЛОДИСМЕНТЫ', 'ВЫВОДЫ', 'ИНСАЙТ', 'ЗАПИСЬ', 'ВИДЕО', 'ИСТОРИЯ', 'ФИНАЛ'],
    growth: ['РАЗВИТИЕ', 'ЛИГА', 'БРОНЗА', 'СЕРЕБРО', 'ЗОЛОТО', 'РУБИН', 'ПРОГРЕСС', 'ЦЕЛЬ', 'НАВЫК', 'ПРАКТИКА',
      'МАТЕРИАЛЫ', 'КУРС', 'СТАТЬЯ', 'РЕПЕТИЦИЯ', 'ПРОГОН', 'МЕНТОР', 'УРОВЕНЬ', 'ОПЫТ', 'ВЫСТУПЛЕНИЕ', 'ШАГ'],
    'event-edit': ['МЕРОПРИЯТИЕ', 'ПРОГРАММА', 'ТРЕКИ', 'ПЛОЩАДКА', 'ЗАЛ', 'РАСПИСАНИЕ', 'ГОНОРАР', 'БЮДЖЕТ', 'ДЕДЛАЙН',
      'АНКЕТА', 'ВОПРОСЫ', 'ОПИСАНИЕ', 'ПУБЛИКАЦИЯ', 'ЧЕРНОВИК', 'ФОРМАТ', 'ЛИМИТ', 'ОПЛАТА', 'ПАРТНЁРЫ', 'СЛОТ', 'АФИША'],
    apps: ['ЗАЯВКА', 'СПИКЕР', 'АННОТАЦИЯ', 'ТЕМА', 'ПРИНЯТЬ', 'ОТКЛОНИТЬ', 'РЕШЕНИЕ', 'ОТВЕТ', 'ПИСЬМО', 'ПРОФИЛЬ',
      'ЛИГА', 'ОПЫТ', 'ДОКЛАД', 'ОТБОР', 'КОМИТЕТ', 'ШОРТЛИСТ', 'СТАТУС', 'ТРЕК', 'ССЫЛКИ', 'ПОРТФОЛИО'],
  }
  const ALL = [...new Set(Object.values(SCREENS).flat())]
  const letter = () => ABC[Math.random() * ABC.length | 0]
  const SPOT_CSS = `[data-spot]{position:relative}
[data-spot]::before,[data-spot]::after{content:"";position:absolute;inset:0;border-radius:inherit;pointer-events:none;opacity:0;transition:opacity .35s cubic-bezier(.2,.7,.2,1)}
[data-spot]::after{background:radial-gradient(420px circle at var(--x,50%) var(--y,50%),rgba(var(--spot-rgb),.07),transparent 60%)}
[data-spot]::before{padding:1px;background:radial-gradient(240px circle at var(--x,50%) var(--y,50%),rgba(var(--spot-rgb),.75),transparent 65%);-webkit-mask:linear-gradient(#000 0 0) content-box,linear-gradient(#000 0 0);-webkit-mask-composite:xor;mask-composite:exclude}
[data-spot]:hover::before,[data-spot]:hover::after{opacity:1}`
  const meter = document.createElement('canvas').getContext('2d')
  const STRETCH = { '75%': 'condensed', '87.5%': 'semi-condensed', '112.5%': 'semi-expanded' }
  const calm = () => matchMedia('(prefers-reduced-motion: reduce)').matches || matchMedia('(hover: none)').matches

  // Холст под содержимым элемента + перевод координат курсора с учётом масштаба холста
  function layer(el, height, follow) {
    const cs = getComputedStyle(el)
    if (cs.position === 'static') el.style.position = 'relative'
    if (cs.isolation !== 'isolate' && cs.zIndex === 'auto') el.style.isolation = 'isolate'
    const c = document.createElement('canvas')
    c.setAttribute('aria-hidden', 'true')
    const size = follow ? `width:${follow[0]}px;height:${follow[1]}px` : `width:100%;height:${height ? height + 'px' : '100%'}`
    c.style.cssText = `position:absolute;left:0;top:0;${size};z-index:-1;pointer-events:none;border-radius:inherit`
    el.prepend(c)
    const ctx = c.getContext('2d')
    // Координаты в системе элемента: холст может сдвигаться, а клетки следа остаются на месте
    const scale = () => { const r = el.getBoundingClientRect(); return { r, s: r.width / el.offsetWidth || 1 } }
    const local = e => {
      const { r, s } = scale()
      return { x: (e.clientX - r.left) / s, y: (e.clientY - r.top) / s }
    }
    return { c, ctx, local, scale }
  }

  function listen(host, handlers) {
    for (const k in handlers) host.addEventListener(k, handlers[k])
    return () => { for (const k in handlers) host.removeEventListener(k, handlers[k]) }
  }

  function attach(el, { color = '#fff', height, glyphs = 'wave', words, avoid = false, solid, follow, ink = false, font, cell, self = false }) {
    const list = SCREENS[words] ?? ALL
    // В режиме ink сетка и буквы мельче, чтобы след пролезал в узкие просветы между плитками и строками
    const [gw, gh] = cell ?? (ink ? [7, 12] : [CW, CH]), pad = ink ? 2 : 7
    const { c, ctx, local, scale } = layer(el, height, follow)
    const host = self ? el : el.closest('[data-trail-host]') || el
    const cells = new Map()
    let last = null, raf = 0, travel = 0, blocks = [], measured = 0, ox = 0, oy = 0

    // Прямоугольники статичного содержимого в координатах элемента (с отступом); при follow — только рядом с холстом
    const measure = () => {
      if (!avoid) return
      measured = performance.now()
      const { r, s } = scale()
      const top = Math.max(r.top, r.top + (oy - 200) * s), bottom = Math.min(r.bottom, r.top + (oy + c.clientHeight + 200) * s)
      const left = r.left + (ox - 120) * s, right = r.left + (ox + c.clientWidth + 120) * s
      const near = b => b.width && b.bottom > top && b.top < bottom && b.right > left && b.left < right
      blocks = []
      const push = (l, t, rr, bb, pad) => blocks.push({ l: (l - r.left) / s - pad, t: (t - r.top) / s - pad, r: (rr - r.left) / s + pad, b: (bb - r.top) / s + pad })
      const add = b => { if (near(b)) push(b.left, b.top, b.right, b.bottom, pad) }
      // Контур глифа: бокс символа из раскладки + метрики начертания (базовая линия, выносные элементы)
      const fonts = new Map()
      const glyph = (n, i, b) => {
        const p = n.parentElement
        let f = fonts.get(p)
        if (!f) {
          const cs = getComputedStyle(p)
          f = { font: `${cs.fontStyle} ${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`, stretch: STRETCH[cs.fontStretch] ?? 'normal', upper: cs.textTransform === 'uppercase' }
          fonts.set(p, f)
        }
        meter.font = f.font
        meter.fontStretch = f.stretch
        const m = meter.measureText(f.upper ? n.data[i].toUpperCase() : n.data[i])
        const base = b.top + m.fontBoundingBoxAscent * s
        push(b.left - m.actualBoundingBoxLeft * s, base - m.actualBoundingBoxAscent * s, b.left + m.actualBoundingBoxRight * s, base + m.actualBoundingBoxDescent * s, 2)
      }
      const range = document.createRange()
      const walk = document.createTreeWalker(host, NodeFilter.SHOW_TEXT, { acceptNode: n => n.data.trim() ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT })
      for (let n; (n = walk.nextNode());) {
        range.selectNodeContents(n)
        const lines = [...range.getClientRects()].filter(near)
        if (!lines.length) continue
        if (!ink) { lines.forEach(add); continue }
        for (let i = 0; i < n.data.length; i++) {
          if (!n.data[i].trim()) continue
          range.setStart(n, i)
          range.setEnd(n, i + 1)
          const b = range.getBoundingClientRect()
          if (near(b)) glyph(n, i, b)
        }
      }
      host.querySelectorAll('input, svg, .ava, .logo i, .search' + (solid ? ', ' + solid : '')).forEach(e => add(e.getBoundingClientRect()))
    }
    const hw = ink ? gw * .43 : gw / 2, hh = ink ? gh * .375 : gh / 2
    const free = (cx, cy) => {
      const x = cx * gw, y = cy * gh
      return !blocks.some(b => x + hw > b.l && x - hw < b.r && y + hh > b.t && y - hh < b.b)
    }

    const fit = () => {
      const d = devicePixelRatio || 1
      c.width = c.clientWidth * d
      c.height = c.clientHeight * d
      ctx.setTransform(d, 0, 0, d, -ox * d, -oy * d)
      ctx.fillStyle = color
      ctx.font = `500 ${font ?? (ink ? 9 : 12)}px ui-monospace, SFMono-Regular, Menlo, monospace`
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      measure()
    }
    const stamp = (x, y, now) => {
      const cx = Math.round(x / gw), cy = Math.round(y / gh)
      const rx = ink ? 4 : 3, ry = ink ? 3 : 2
      for (let i = -rx; i <= rx; i++) for (let j = -ry; j <= ry; j++) {
        const dist = Math.hypot(i / (rx + .5), j / (ry + .5))
        if (dist > 1) continue
        if (!free(cx + i, cy + j)) continue
        const k = (cx + i) + ':' + (cy + j)
        const amp = (1 - dist * .8) * (.5 + Math.random() * .5)
        const o = cells.get(k)
        if (o?.word) continue
        if (!o || o.amp * (1 - (now - o.t) / o.life) < amp) cells.set(k, { x: cx + i, y: cy + j, t: now, life: LIFE, amp, ch: o?.ch ?? letter() })
      }
    }
    // Слово сначала перебирается случайными буквами, потом «расшифровывается» слева направо
    const word = (x, y, now) => {
      const w = list[Math.random() * list.length | 0]
      const cx = Math.round(x / gw) - (w.length >> 1), cy = Math.round(y / gh) - 2
      if (![...w].every((_, i) => free(cx + i, cy))) return
      ;[...w].forEach((ch, i) => cells.set((cx + i) + ':' + cy, { x: cx + i, y: cy, t: now, life: 1700, amp: 1, ch: letter(), word: ch, at: now + 140 + i * 45 }))
    }
    const draw = now => {
      ctx.clearRect(ox, oy, c.clientWidth, c.clientHeight)
      for (const [k, o] of cells) {
        const age = (now - o.t) / o.life
        if (age >= 1) { cells.delete(k); continue }
        if (glyphs === 'wave') {
          const lvl = o.amp * (1 - age) ** 1.4 * (.65 + .35 * Math.sin(now / 90 + o.x * .9))
          const h = Math.max(2, lvl * (gh - 4))
          ctx.globalAlpha = .2 + .7 * lvl
          ctx.fillRect(o.x * gw - 1.5, o.y * gh - h / 2, 3, h)
          continue
        }
        if (o.word && now >= o.at) o.ch = o.word
        else if (Math.random() < (o.word ? .5 : .12 * (1 - age))) o.ch = letter()
        ctx.globalAlpha = o.word ? (1 - age ** 3) : .15 + .8 * o.amp * (1 - age) ** 1.2
        ctx.fillText(o.ch, o.x * gw, o.y * gh)
      }
      raf = cells.size ? requestAnimationFrame(draw) : 0
    }
    // Холст следует за курсором, пока след не догорит; при сдвиге перерисовываем с новым началом координат
    const shift = (x, y) => {
      const nx = Math.round(Math.min(Math.max(0, x - c.clientWidth / 2), Math.max(0, el.offsetWidth - c.clientWidth)))
      const ny = Math.round(Math.min(Math.max(0, y - c.clientHeight / 2), Math.max(0, el.offsetHeight - c.clientHeight)))
      if (Math.abs(nx - ox) + Math.abs(ny - oy) < 160) return
      ox = nx; oy = ny
      c.style.transform = `translate(${ox}px,${oy}px)`
      const d = devicePixelRatio || 1
      ctx.setTransform(d, 0, 0, d, -ox * d, -oy * d)
      measured = 0
    }
    const move = e => {
      const { x, y } = local(e)
      if (follow) shift(x, y)
      if (y < oy || y > oy + c.clientHeight) { last = null; return }
      const now = performance.now()
      // Шапка липкая и сдвигается при прокрутке — пересчитываем раскладку не чаще раза в 400 мс
      if (avoid && now - measured > 400) measure()
      const d = last ? Math.hypot(x - last.x, y - last.y) : 0
      travel += d
      if (last) {
        const n = Math.min(60, Math.ceil(d / (gw * .8)))
        for (let i = 1; i <= n; i++) stamp(last.x + (x - last.x) * i / n, last.y + (y - last.y) * i / n, now)
      } else stamp(x, y, now)
      if (glyphs === 'words' && travel > 260) { travel = 0; word(x, y, now) }
      last = { x, y }
      if (!raf) raf = requestAnimationFrame(draw)
    }

    fit()
    const ro = new ResizeObserver(fit)
    ro.observe(c)
    const off = listen(host, { pointerenter: measure, pointermove: move, pointerleave: () => { last = null } })
    return () => {
      ro.disconnect()
      cancelAnimationFrame(raf)
      off()
      c.remove()
    }
  }

  // Пятна индиго, рубина и шербета догоняют курсор с разной инерцией
  function magnet(el, [c1, c2, c3]) {
    const host = el.closest('[data-trail-host]') || el
    const blobs = [[c1, .09, 231], [c2, .05, 187], [c3, .03, 205]].map(([bg, k, size]) => {
      const b = document.createElement('i')
      b.setAttribute('aria-hidden', 'true')
      b.style.cssText = `position:absolute;left:0;top:0;width:${size}px;height:${size}px;margin:${-size / 2}px 0 0 ${-size / 2}px;border-radius:50%;background:${bg};filter:blur(32px);opacity:0;z-index:-2;pointer-events:none;transition:opacity .8s;will-change:transform`
      el.append(b)
      return { b, k, x: 0, y: 0 }
    })
    let tx = 0, ty = 0, raf = 0, on = false
    const tick = () => {
      let moving = false
      for (const p of blobs) {
        p.x += (tx - p.x) * p.k
        p.y += (ty - p.y) * p.k
        if (Math.abs(tx - p.x) + Math.abs(ty - p.y) > .5) moving = true
        p.b.style.transform = `translate3d(${p.x}px,${p.y}px,0)`
      }
      raf = moving ? requestAnimationFrame(tick) : 0
    }
    const move = e => {
      const r = el.getBoundingClientRect(), s = r.width / el.clientWidth || 1
      tx = (e.clientX - r.left) / s
      ty = (e.clientY - r.top) / s
      if (!on) {
        on = true
        for (const p of blobs) { if (!p.x && !p.y) { p.x = tx; p.y = ty } p.b.style.opacity = '.75' }
      }
      if (!raf) raf = requestAnimationFrame(tick)
    }
    const leave = () => { on = false; for (const p of blobs) p.b.style.opacity = '0' }
    const off = listen(host, { pointermove: move, pointerleave: leave })
    return () => { off(); cancelAnimationFrame(raf); blobs.forEach(p => p.b.remove()) }
  }

  function spot(el, rgb) {
    if (!document.getElementById('trix-spot')) {
      const s = document.createElement('style')
      s.id = 'trix-spot'
      s.textContent = SPOT_CSS
      document.head.append(s)
    }
    el.style.setProperty('--spot-rgb', rgb)
    return listen(el, {
      pointermove: e => {
        const r = el.getBoundingClientRect(), s = r.width / el.clientWidth || 1
        el.style.setProperty('--x', (e.clientX - r.left) / s + 'px')
        el.style.setProperty('--y', (e.clientY - r.top) / s + 'px')
      },
    })
  }

  // Подключение к элементам по селектору; компоненты дизайн-систем дорисовываются позже — досканируем 3 секунды
  function each(selector, fn, mark) {
    if (calm()) return () => {}
    const stops = []
    const scan = () => document.querySelectorAll(selector).forEach(el => {
      if (el.dataset[mark]) return
      el.dataset[mark] = '1'
      const stop = fn(el)
      stops.push(() => { stop(); delete el.dataset[mark] })
    })
    scan()
    let n = 0
    const iv = setInterval(() => { scan(); if (++n >= 15) clearInterval(iv) }, 200)
    return () => { clearInterval(iv); stops.forEach(f => f()) }
  }

  window.TrixTrail = {
    mount: (selector, opts = () => ({})) => each(selector, el => attach(el, opts(el)), 'trail'),
    attach: (el, opts) => calm() ? () => {} : attach(el, opts),
    magnet: (selector, colors = ['#533afd', '#ea2261', '#ffd29a']) => each(selector, el => magnet(el, colors), 'magnet'),
    spot: (selector, rgb = '83,58,253') => each(selector, el => spot(el, rgb), 'spot'),
  }
})()
