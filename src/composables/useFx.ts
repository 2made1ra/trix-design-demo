import { onBeforeUnmount, onMounted, type ShallowRef } from 'vue'

// Эффекты дизайн-схемы: след из букв и слов за курсором, подсветка карточек, glow за курсором, появление блоков,
// бегущая строка и рельс ленты. При «Уменьшении движения» и на тач-экранах остаётся статичная страница.

const ABC = 'АБВГДЕЖЗИКЛМНОПРСТУФХЦЧШЩЭЮЯабвгдежзиклмнопрстуфхцчшщэюя'
const WORDS = {
  home: 'ДОКЛАД СЦЕНА СПИКЕР МЕРОПРИЯТИЕ ПОДБОРКА РАЗБОР ДЕДЛАЙН ЗАЯВКА АУДИТОРИЯ СЛАЙДЫ ТАЙМИНГ ПРОГРЕСС РЕЙТИНГ МИТАП КОНФЕРЕНЦИЯ ОРГАНИЗАТОР ПРОФИЛЬ ВЫСТУПЛЕНИЕ ЗАЛ МИКРОФОН',
  landing:
    'НАДЁЖНОСТЬ ИНЦИДЕНТ ПОСТМОРТЕМ МИГРАЦИЯ ОТКАТ МЕТРИКИ ТРЕЙСЫ ПРОДАКШЕН АПТАЙМ РЕЛИЗ АЛЕРТ ЛОГИ КЛАСТЕР НАГРУЗКА ДОКЛАД СЦЕНА ТРЕК',
  onboarding:
    'СФЕРА УРОВЕНЬ БЭКЕНД ФРОНТЕНД МОБАЙЛ ДАННЫЕ ДЕВОПС ТЕСТИРОВАНИЕ ДИЗАЙН АНАЛИТИКА ДЖУН МИДЛ СЕНЬОР ЛИД ОПЫТ СТЕК НАВЫКИ ПРОФИЛЬ СТАРТ',
  selection:
    'МИТАП КОНФЕРЕНЦИЯ ФЕСТИВАЛЬ ХАКАТОН ВОРКШОП СЕКЦИЯ ПРОГРАММА ДЕДЛАЙН ЗАЯВКА ТРЕК ФОРМАТ ОНЛАЙН ОФЛАЙН ГОРОД ДАТА ПОДБОРКА СЦЕНА БЛИЦ',
  review:
    'РАЗБОР ОТЗЫВЫ ОЦЕНКА ВОПРОСЫ ТАЙМИНГ ПОДАЧА СТРУКТУРА СЛАЙДЫ ДИКЦИЯ ПАУЗЫ ТЕМП КОНТАКТ ЗАЛ ВЫВОДЫ ИНСАЙТ ЗАПИСЬ ВИДЕО ФИНАЛ',
  growth:
    'РАЗВИТИЕ ЛИГА БРОНЗА СЕРЕБРО ЗОЛОТО РУБИН ПРОГРЕСС ЦЕЛЬ НАВЫК ПРАКТИКА МАТЕРИАЛЫ КУРС СТАТЬЯ РЕПЕТИЦИЯ ПРОГОН МЕНТОР ОПЫТ ШАГ',
  editor:
    'МЕРОПРИЯТИЕ ПРОГРАММА ТРЕКИ ПЛОЩАДКА ЗАЛ РАСПИСАНИЕ ГОНОРАР ДЕДЛАЙН АНКЕТА ВОПРОСЫ ОПИСАНИЕ ПУБЛИКАЦИЯ ФОРМАТ ОПЛАТА СЛОТ АФИША',
  applications:
    'ЗАЯВКА СПИКЕР АННОТАЦИЯ ТЕМА ПРИНЯТЬ ОТКЛОНИТЬ РЕШЕНИЕ ОТВЕТ ПИСЬМО ПРОФИЛЬ ЛИГА ОПЫТ ДОКЛАД ОТБОР КОМИТЕТ ШОРТЛИСТ СТАТУС ТРЕК',
}
const SOLID = '.tile, .tag, .pick, .ticker, header, input, textarea, button, [data-slot=button], [data-solid]'
const GLOWS = '.tile, .glow-block, [class*="fill-"], [class*="surface-"]'
const STRETCH: Record<string, string> = { '75%': 'condensed', '87.5%': 'semi-condensed' }
const [FONT, GW, GH] = [9, 7, 12]
const FOLLOW = [1100, 760] as const

export type FxOptions = {
  words: keyof typeof WORDS
  ink?: boolean
  fade?: number
  rate?: number
  blocks?: boolean
  rail?: boolean
}

type Box = { l: number; t: number; r: number; b: number }
type Cell = {
  x: number
  y: number
  t: number
  life: number
  amp: number
  k: number
  ch: string
  word?: string
  at?: number
}

const calm = () => matchMedia('(prefers-reduced-motion: reduce), (hover: none)').matches
const letter = () => ABC[(Math.random() * ABC.length) | 0] as string
const rgb = (color: string) => (color.match(/[\d.]+/g) ?? []).slice(0, 3).map(Number)
const luma = (color: string) => {
  const [r = 0, g = 0, b = 0] = rgb(color)
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}
const hexRgb = (hex: string) =>
  (hex.match(/\w\w/g) ?? []).map((h) => Number.parseInt(h, 16)).join(' ') || rgb(hex).join(' ')
const listen = (target: EventTarget, handlers: Record<string, (e: never) => void>) => {
  for (const [k, h] of Object.entries(handlers)) target.addEventListener(k, h as EventListener, { passive: true })
  return () => {
    for (const [k, h] of Object.entries(handlers)) target.removeEventListener(k, h as EventListener)
  }
}

// След: холст 1100×760 ездит за курсором под содержимым, буквы обходят текст (по глифам при ink или блоками)
const trail = (el: HTMLElement, o: FxOptions & { color: () => string }) => {
  const list = WORDS[o.words].split(' ')
  const ink = !!o.ink
  const fade = o.fade ?? 140
  const pad = ink ? 2 : 7
  const canvas = document.createElement('canvas')
  canvas.setAttribute('aria-hidden', 'true')
  canvas.style.cssText = `position:absolute;left:0;top:0;width:${FOLLOW[0]}px;height:${FOLLOW[1]}px;z-index:-1;pointer-events:none;border-radius:inherit`
  if (getComputedStyle(el).position === 'static') el.style.position = 'relative'
  el.style.isolation = 'isolate'
  el.prepend(canvas)
  const ctx = canvas.getContext('2d') as CanvasRenderingContext2D
  const meter = document.createElement('canvas').getContext('2d') as CanvasRenderingContext2D
  const cells = new Map<string, Cell>()
  let last: { x: number; y: number } | null = null
  let raf = 0
  let travel = 0
  let measured = 0
  let ox = 0
  let oy = 0
  let blocks: Box[] = []

  const local = (e: PointerEvent) => {
    const r = el.getBoundingClientRect()
    return { x: e.clientX - r.left, y: e.clientY - r.top }
  }
  const measure = () => {
    measured = performance.now()
    // Цвет перечитываем вместе с раскладкой: тема могла смениться
    ctx.fillStyle = o.color()
    const r = el.getBoundingClientRect()
    const near = (b: DOMRect) =>
      b.width &&
      b.bottom > r.top + oy - 200 &&
      b.top < r.top + oy + FOLLOW[1] + 200 &&
      b.right > r.left + ox - 120 &&
      b.left < r.left + ox + FOLLOW[0] + 120
    const push = (l: number, t: number, rr: number, bb: number, p: number) =>
      blocks.push({ l: l - r.left - p, t: t - r.top - p, r: rr - r.left + p, b: bb - r.top + p })
    const add = (b: DOMRect) => near(b) && push(b.left, b.top, b.right, b.bottom, pad)
    blocks = []
    const fonts = new Map<Element, { font: string; stretch: string; upper: boolean }>()
    const range = document.createRange()
    const walk = document.createTreeWalker(el, NodeFilter.SHOW_TEXT, {
      acceptNode: (n) => (n.textContent?.trim() ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT),
    })
    for (let n = walk.nextNode() as Text | null; n; n = walk.nextNode() as Text | null) {
      range.selectNodeContents(n)
      const lines = [...range.getClientRects()].filter(near)
      if (!lines.length) continue
      if (!ink) {
        lines.forEach(add)
        continue
      }
      const parent = n.parentElement as Element
      let f = fonts.get(parent)
      if (!f) {
        const cs = getComputedStyle(parent)
        f = {
          font: `${cs.fontStyle} ${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`,
          stretch: STRETCH[cs.fontStretch] ?? 'normal',
          upper: cs.textTransform === 'uppercase',
        }
        fonts.set(parent, f)
      }
      meter.font = f.font
      meter.fontStretch = f.stretch as CanvasFontStretch
      // Контур глифа: бокс символа из раскладки и метрики начертания, чтобы след просачивался между буквами
      for (let i = 0; i < n.data.length; i++) {
        const ch = n.data[i] as string
        if (!ch.trim()) continue
        range.setStart(n, i)
        range.setEnd(n, i + 1)
        const b = range.getBoundingClientRect()
        if (!near(b)) continue
        const m = meter.measureText(f.upper ? ch.toUpperCase() : ch)
        const base = b.top + m.fontBoundingBoxAscent
        push(
          b.left - m.actualBoundingBoxLeft,
          base - m.actualBoundingBoxAscent,
          b.left + m.actualBoundingBoxRight,
          base + m.actualBoundingBoxDescent,
          2,
        )
      }
    }
    for (const e of el.querySelectorAll(`svg, ${SOLID}`)) add(e.getBoundingClientRect())
    if (!ink)
      for (const e of el.querySelectorAll('p, li, dd, blockquote')) {
        if ((e.textContent?.trim().length ?? 0) < 60) continue
        const b = e.getBoundingClientRect()
        if (near(b)) push(b.left, b.top, b.right, b.bottom, 16)
      }
  }
  const [hw, hh] = ink ? [GW * 0.43, GH * 0.375] : [GW / 2, GH / 2]
  const free = (cx: number, cy: number) => {
    const x = cx * GW
    const y = cy * GH
    return !blocks.some((b) => x + hw > b.l && x - hw < b.r && y + hh > b.t && y - hh < b.b)
  }
  // Затухание у текста: 0 у самого блока, 1 дальше fade px
  const soft = (x: number, y: number) => {
    if (!fade) return 1
    let d = fade
    for (const b of blocks) d = Math.min(d, Math.hypot(Math.max(b.l - x, 0, x - b.r), Math.max(b.t - y, 0, y - b.b)))
    const k = d / fade
    return k * k * (3 - 2 * k)
  }
  const stamp = (x: number, y: number, now: number) => {
    const f = soft(x, y)
    if (f < 0.03) return
    const cx = Math.round(x / GW)
    const cy = Math.round(y / GH)
    const rx = Math.round((ink ? 4 : 3) * 0.6)
    const ry = Math.max(1, Math.round((ink ? 3 : 2) * 0.6))
    for (let i = -rx; i <= rx; i++)
      for (let j = -ry; j <= ry; j++) {
        const dist = Math.hypot(i / (rx + 0.5), j / (ry + 0.5))
        if (dist > 1 || !free(cx + i, cy + j)) continue
        const key = `${cx + i}:${cy + j}`
        const amp = (1 - dist * 0.8) * (0.5 + Math.random() * 0.5)
        const old = cells.get(key)
        if (old?.word) continue
        if (!old || old.amp * old.k * (1 - (now - old.t) / old.life) < amp * f)
          cells.set(key, { x: cx + i, y: cy + j, t: now, life: 1100, amp, k: f, ch: old?.ch ?? letter() })
      }
  }
  // Слово сначала перебирается случайными буквами, потом расшифровывается слева направо
  const word = (x: number, y: number, now: number) => {
    const w = [...(list[(Math.random() * list.length) | 0] as string)]
    const cx = Math.round(x / GW) - (w.length >> 1)
    const cy = Math.round(y / GH) - 2
    if (soft(x, y) < 0.5 || !w.every((_, i) => free(cx + i, cy))) return
    w.forEach((ch, i) => {
      cells.set(`${cx + i}:${cy}`, {
        x: cx + i,
        y: cy,
        t: now,
        life: 1700,
        amp: 1,
        k: 1,
        ch: letter(),
        word: ch,
        at: now + 140 + i * 45,
      })
    })
  }
  const draw = (now: number) => {
    ctx.clearRect(ox, oy, FOLLOW[0], FOLLOW[1])
    for (const [key, c] of cells) {
      const age = (now - c.t) / c.life
      if (age >= 1) {
        cells.delete(key)
        continue
      }
      if (c.word && now >= (c.at ?? 0)) c.ch = c.word
      else if (Math.random() < (c.word ? 0.5 : 0.12 * (1 - age))) c.ch = letter()
      ctx.globalAlpha = (c.word ? 1 - age ** 3 : 0.15 + 0.8 * c.amp * (1 - age) ** 1.2) * c.k
      ctx.fillText(c.ch, c.x * GW, c.y * GH)
    }
    raf = cells.size ? requestAnimationFrame(draw) : 0
  }
  const fit = () => {
    const d = devicePixelRatio || 1
    canvas.width = FOLLOW[0] * d
    canvas.height = FOLLOW[1] * d
    ctx.setTransform(d, 0, 0, d, -ox * d, -oy * d)
    ctx.fillStyle = o.color()
    ctx.font = `500 ${FONT}px ui-monospace, SFMono-Regular, Menlo, monospace`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
  }
  // Холст переезжает за курсором, когда тот уходит от центра дальше 160 px
  const shift = (x: number, y: number) => {
    const nx = Math.round(Math.min(Math.max(0, x - FOLLOW[0] / 2), Math.max(0, el.offsetWidth - FOLLOW[0])))
    const ny = Math.round(Math.min(Math.max(0, y - FOLLOW[1] / 2), Math.max(0, el.offsetHeight - FOLLOW[1])))
    if (Math.abs(nx - ox) + Math.abs(ny - oy) < 160) return
    ox = nx
    oy = ny
    canvas.style.transform = `translate(${ox}px,${oy}px)`
    fit()
    measured = 0
  }
  const move = (e: PointerEvent) => {
    const { x, y } = local(e)
    shift(x, y)
    const now = performance.now()
    // Шапка липкая, раскладка меняется при прокрутке — пересчитываем не чаще раза в 400 мс
    if (now - measured > 400) measure()
    const d = last ? Math.hypot(x - last.x, y - last.y) : 0
    travel += d
    if (last) {
      const n = Math.min(60, Math.ceil(d / (GW * 0.8)))
      for (let i = 1; i <= n; i++) stamp(last.x + ((x - last.x) * i) / n, last.y + ((y - last.y) * i) / n, now)
    } else stamp(x, y, now)
    if (travel > (o.rate ?? 560)) {
      travel = 0
      word(x, y, now)
    }
    last = { x, y }
    raf ||= requestAnimationFrame(draw)
  }

  fit()
  const off = listen(el, {
    pointerenter: measure,
    pointermove: move,
    pointerleave: () => {
      last = null
    },
  })
  return () => {
    off()
    cancelAnimationFrame(raf)
    canvas.remove()
  }
}

// Glow: пятна поверхностей под курсором тянутся за ним, фон страницы — за курсором по окну
const glow = (root: HTMLElement) => {
  const mesh = root.closest<HTMLElement>('.design-mesh') ?? root
  let lit = new Set<HTMLElement>()
  const unset = (el: HTMLElement) => {
    el.style.removeProperty('--gx')
    el.style.removeProperty('--gy')
  }
  const move = (e: PointerEvent) => {
    mesh.style.setProperty('--px', ((e.clientX / innerWidth) * 2 - 1).toFixed(3))
    mesh.style.setProperty('--py', ((e.clientY / innerHeight) * 2 - 1).toFixed(3))
    const next = new Set<HTMLElement>()
    for (
      let el: HTMLElement | null | undefined = (e.target as Element).closest?.<HTMLElement>(GLOWS);
      el && root.contains(el);
      el = el.parentElement?.closest<HTMLElement>(GLOWS)
    ) {
      const r = el.getBoundingClientRect()
      el.style.setProperty('--gx', (((e.clientX - r.left) / r.width) * 2 - 1).toFixed(3))
      el.style.setProperty('--gy', (((e.clientY - r.top) / r.height) * 2 - 1).toFixed(3))
      next.add(el)
    }
    for (const el of lit) if (!next.has(el)) unset(el)
    lit = next
  }
  const off = listen(root, { pointermove: move })
  return () => {
    off()
    lit.forEach(unset)
  }
}

// Подсветка карточек: на светлых — акцент следа, на тёмных и цветных — яркая мята или цвет текста
const spot = (el: HTMLElement, trailColor: string) => {
  const cs = getComputedStyle(el)
  const light = luma(cs.color) > 150
  el.dataset.spot = ''
  el.style.setProperty(
    '--spot',
    light
      ? hexRgb(getComputedStyle(document.documentElement).getPropertyValue('--l-mint').trim())
      : luma(cs.backgroundColor) < 236 && cs.backgroundColor !== 'rgba(0, 0, 0, 0)'
        ? rgb(cs.color).join(' ')
        : hexRgb(trailColor),
  )
  const off = listen(el, {
    pointermove: (e: PointerEvent) => {
      const r = el.getBoundingClientRect()
      el.style.setProperty('--x', `${e.clientX - r.left}px`)
      el.style.setProperty('--y', `${e.clientY - r.top}px`)
    },
  })
  return () => {
    off()
    delete el.dataset.spot
  }
}

const rise = (el: HTMLElement, delay: number) =>
  el.animate(
    [
      { opacity: 0, transform: 'translateY(48px)' },
      { opacity: 1, transform: 'none' },
    ],
    {
      duration: 950,
      delay,
      easing: 'cubic-bezier(.16,.8,.24,1)',
      fill: 'backwards',
    },
  )

// Бегущая строка: дорожка клонируется до двойной ширины и едет со скоростью 60 px/с
const ticker = (el: HTMLElement) => {
  const track = el.querySelector<HTMLElement>('.ticker-track')
  if (!track) return () => {}
  const base = [...track.children]
  const clones: Element[] = []
  for (let n = 0; n < 12 && track.scrollWidth < el.offsetWidth * 2.2; n++)
    for (const c of base) clones.push(track.appendChild(c.cloneNode(true) as Element))
  let x = 0
  let last = performance.now()
  let raf = 0
  const half = track.scrollWidth / 2
  const loop = (now: number) => {
    x -= (60 * Math.min(64, now - last)) / 1000
    last = now
    if (x < -half) x += half
    track.style.transform = `translateX(${x}px)`
    raf = requestAnimationFrame(loop)
  }
  raf = requestAnimationFrame(loop)
  return () => {
    cancelAnimationFrame(raf)
    for (const c of clones) c.remove()
    track.style.transform = ''
  }
}

// Рельс ленты дорисовывается до последнего показанного пункта, пройденные точки загораются мятой
const rail = (stream: HTMLElement) => {
  const bar = document.createElement('i')
  bar.className = 'stream-rail'
  bar.setAttribute('aria-hidden', 'true')
  stream.append(bar)
  const items = () => [...stream.querySelectorAll<HTMLElement>(':scope > .stream-item')]
  const seen = new Set<Element>()
  let p = 0
  let raf = 0
  const loop = () => {
    const all = items()
    const h = stream.offsetHeight
    const t =
      seen.size && seen.size === all.length
        ? 1
        : Math.max(0, ...[...seen].map((it) => ((it as HTMLElement).offsetTop + 24) / h))
    p += (t - p) * 0.08
    bar.style.transform = `scaleY(${p})`
    for (const it of all) it.classList.toggle('hit', (it.offsetTop + 22) / h <= p + 0.002)
    raf = Math.abs(t - p) > 0.001 ? requestAnimationFrame(loop) : 0
  }
  const io = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (e.isIntersecting || e.boundingClientRect.bottom < 0) seen.add(e.target)
        else seen.delete(e.target)
      }
      raf ||= requestAnimationFrame(loop)
    },
    { rootMargin: '0px 0px -30% 0px' },
  )
  const observe = () => {
    for (const it of items()) io.observe(it)
  }
  observe()
  return {
    observe,
    stop: () => {
      io.disconnect()
      cancelAnimationFrame(raf)
      bar.remove()
    },
  }
}

export const useFx = (root: Readonly<ShallowRef<HTMLElement | null>>, options: FxOptions) => {
  const stops: (() => void)[] = []
  onMounted(() => {
    const el = root.value
    if (!el || calm()) return
    const color = getComputedStyle(el).getPropertyValue('--trail').trim()
    // След и glow — на всю страницу вместе с шапкой и подвалом, как в схеме, а не только в контейнере контента
    const page = el.closest<HTMLElement>('.design') ?? el
    const seen = new WeakSet<Element>()
    const rails: ReturnType<typeof rail>[] = []
    const fresh = (selector: string) =>
      [...el.querySelectorAll<HTMLElement>(selector)].filter((it) => !seen.has(it) && seen.add(it))
    // Появление: блок поднимается, когда попадает в окно. При быстрой прокрутке и переходе по якорю всё, что выше,
    // проявляется вместе с ним — иначе пролетевшие мимо блоки так и остались бы скрытыми
    const pending = new Set<HTMLElement>()
    const show = (it: HTMLElement, delay: number) => {
      pending.delete(it)
      io.unobserve(it)
      it.style.opacity = ''
      rise(it, delay)
    }
    const io = new IntersectionObserver(
      (entries) => {
        let i = 0
        for (const e of entries) {
          const target = e.target as HTMLElement
          if ((!e.isIntersecting && e.boundingClientRect.bottom >= 0) || !pending.has(target)) continue
          for (const it of pending)
            if (target.compareDocumentPosition(it) & Node.DOCUMENT_POSITION_PRECEDING) show(it, 0)
          show(target, i++ * 90)
        }
      },
      { rootMargin: '0px 0px -8% 0px' },
    )
    // Содержимое страниц приходит с API позже монтирования — новые блоки подхватываем по мере появления
    const scan = () => {
      for (const it of fresh('[data-rv]')) {
        pending.add(it)
        it.style.opacity = '0'
        io.observe(it)
      }
      for (const it of fresh('.tile')) stops.push(spot(it, color))
      for (const it of fresh('.ticker')) stops.push(ticker(it))
      if (options.rail)
        for (const it of fresh('.stream')) {
          const r = rail(it)
          rails.push(r)
          stops.push(r.stop)
        }
      for (const r of rails) r.observe()
    }
    let frame = 0
    const mo = new MutationObserver(() => {
      frame ||= requestAnimationFrame(() => {
        frame = 0
        scan()
      })
    })
    scan()
    mo.observe(el, { childList: true, subtree: true })
    stops.push(() => {
      mo.disconnect()
      io.disconnect()
      cancelAnimationFrame(frame)
    }, glow(page))
    // Шрифты и раскладка должны устояться, прежде чем мерить текст для следа
    const t = setTimeout(() => {
      stops.push(trail(page, { ...options, color: () => getComputedStyle(page).getPropertyValue('--trail').trim() }))
      if (options.blocks)
        for (const block of el.querySelectorAll<HTMLElement>('.glow-block, [class*="surface-"]'))
          if (block.offsetWidth >= 280 && block.offsetHeight >= 160)
            stops.push(
              trail(block, { ...options, color: () => getComputedStyle(block).getPropertyValue('--l-mint').trim() }),
            )
    }, 400)
    stops.push(() => clearTimeout(t))
  })
  onBeforeUnmount(() => {
    for (const stop of stops.splice(0)) stop()
  })
}

// Печать второй строки заголовка: варианты по очереди набираются и стираются, курсор мигает в конце
export const useTyping = (
  el: Readonly<ShallowRef<HTMLElement | null>>,
  lines: string[],
  render: (text: string) => void,
) => {
  let tid = 0
  onMounted(() => {
    if (!el.value || matchMedia('(prefers-reduced-motion: reduce)').matches) return
    let v = 0
    let k = 0
    let dir = 1
    const step = () => {
      const line = lines[v] as string
      k += dir
      render(line.slice(0, k))
      if (k === line.length) dir = -1
      else if (!k) {
        dir = 1
        v = (v + 1) % lines.length
      }
      tid = window.setTimeout(step, k === line.length ? 5200 : !k ? 700 : dir > 0 ? 80 : 32)
    }
    render('')
    tid = window.setTimeout(step, 900)
  })
  onBeforeUnmount(() => clearTimeout(tid))
}

// Сценарии демо-карточек: [data-scene="паузы между шагами, мс"]. Пока карточка на экране, шаги идут по кругу:
// data-s="a" или "a-b" — виден на шагах a…b, data-press — нажат с шага, data-x — убран с шага,
// data-typed и data-count — печатает текст или считает таймер mm:ss на своём шаге
export const useScenes = (root: Readonly<ShallowRef<HTMLElement | null>>) => {
  const stops: (() => void)[] = []
  onMounted(() => {
    const live = !matchMedia('(prefers-reduced-motion: reduce)').matches
    for (const scene of root.value?.querySelectorAll<HTMLElement>('[data-scene]') ?? []) {
      const waits = (scene.dataset.scene ?? '').split(',').map(Number)
      const lastStep = waits.length - 1
      const all = (selector: string) => [...scene.querySelectorAll<HTMLElement>(selector)]
      const [shown, pressed, cut, text] = ['[data-s]', '[data-press]', '[data-x]', '[data-typed], [data-count]'].map(
        all,
      )
      for (const it of text ?? []) it.dataset.text ??= it.textContent ?? ''
      const fill = (it: HTMLElement, t: number) => {
        const v = it.dataset.text ?? ''
        if ('typed' in it.dataset) {
          it.textContent = v.slice(0, Math.round(v.length * t))
          return
        }
        const [m = 0, c = 0] = v.split(':').map(Number)
        const n = Math.round((m * 60 + c) * t)
        it.textContent = `${String((n / 60) | 0).padStart(2, '0')}:${String(n % 60).padStart(2, '0')}`
      }
      const rafs: number[] = []
      const tween = (it: HTMLElement, ms: number) => {
        const t0 = performance.now()
        const tick = (now: number) => {
          const t = Math.min(1, (now - t0) / ms)
          fill(it, t)
          if (t < 1) rafs.push(requestAnimationFrame(tick))
        }
        tick(t0)
      }
      let k = 0
      let tid = 0
      const set = (n: number) => {
        k = n
        if (!k) rafs.splice(0).forEach(cancelAnimationFrame)
        for (const it of shown ?? []) {
          const [a = 0, b = Number.POSITIVE_INFINITY] = (it.dataset.s ?? '').split('-').map(Number)
          it.classList.toggle('on', k >= a && k <= b)
        }
        for (const it of pressed ?? []) it.setAttribute('aria-pressed', String(k >= Number(it.dataset.press)))
        for (const it of cut ?? []) it.classList.toggle('x', k >= Number(it.dataset.x))
        for (const it of text ?? []) {
          const a = Number(it.dataset.typed || it.dataset.count)
          if (k < a || !live) fill(it, k < a ? 0 : 1)
          else if (k === a) tween(it, 'typed' in it.dataset ? (it.dataset.text?.length ?? 0) * 38 : 1600)
        }
      }
      scene.classList.add('scene')
      if (!live) {
        set(lastStep)
        continue
      }
      const run = () => {
        tid = window.setTimeout(() => {
          set(k === lastStep ? 0 : k + 1)
          run()
        }, waits[k])
      }
      const io = new IntersectionObserver(
        ([e]) => {
          clearTimeout(tid)
          if (e?.isIntersecting) run()
          else set(0)
        },
        { threshold: 0.35 },
      )
      set(0)
      io.observe(scene)
      stops.push(() => {
        clearTimeout(tid)
        io.disconnect()
        rafs.splice(0).forEach(cancelAnimationFrame)
      })
    }
  })
  onBeforeUnmount(() => {
    for (const stop of stops.splice(0)) stop()
  })
}
