// Мини-рантайм макетов с холста: шаблон из <template id="dc-tpl">, класс Component из data-dc-script,
// {{дырки}}, x-import компонентов дизайн-систем через React и Tweaks из data-props.
// Наружу: window.DCLite = { schema, values(), set(key, value), reset() } и событие 'dc:change' на window.
;(() => {
  const tpl = document.getElementById('dc-tpl')
  const host = document.getElementById('dc')
  const tag = document.querySelector('script[data-dc-script]')
  const { $preview, ...schema } = JSON.parse(tag.getAttribute('data-props') || '{}')
  const store = `dc:${location.pathname}`
  const HOLE = /\{\{\s*([\w$.]+)\s*\}\}/g
  const WHOLE = /^\{\{\s*([\w$.]+)\s*\}\}$/
  const BOOL = new Set(['checked', 'disabled', 'selected', 'required', 'readonly', 'multiple', 'hidden', 'open'])
  const NAMES = { class: 'className', for: 'htmlFor', tabindex: 'tabIndex', readonly: 'readOnly', maxlength: 'maxLength', autocomplete: 'autoComplete', value: 'defaultValue', checked: 'defaultChecked' }
  const VOID = /^(area|br|col|hr|img|input|source|track|wbr)$/

  const get = (o, path) => path.split('.').reduce((v, k) => v?.[k], o)
  const lit = (vals, p) => (p === 'true' ? true : p === 'false' ? false : /^-?\d/.test(p) ? Number(p) : get(vals, p))
  const camel = s => s.replace(/-([a-z])/g, (_, c) => c.toUpperCase())
  const css = s =>
    Object.fromEntries(
      s.split(';').flatMap(d => {
        const i = d.indexOf(':')
        const k = d.slice(0, i).trim()
        return i > 0 && k ? [[k.startsWith('--') ? k : camel(k), d.slice(i + 1).trim()]] : []
      }),
    )

  class DCLogic {
    constructor(props) {
      this.props = props
      this.state = {}
    }
    setState(s) {
      Object.assign(this.state, typeof s === 'function' ? s(this.state, this.props) : s)
      remount()
    }
    forceUpdate() {
      remount()
    }
  }
  window.DCLogic = DCLogic
  const Component = new Function('DCLogic', `${tag.textContent}\nreturn Component`)(DCLogic)

  // Как на холсте: в props попадают только изменённые Tweaks, default лишь подсказка панели.
  // Значения Tweaks: ссылка важнее сохранённых в браузере, неизвестные опции отбрасываем
  const ok = (k, v) => k in schema && (!schema[k].options || schema[k].editor === 'color' || schema[k].options.includes(v))
  const load = () => {
    let saved = {}
    try {
      saved = JSON.parse(localStorage.getItem(store)) ?? {}
    } catch {}
    for (const [k, v] of new URLSearchParams(location.search)) saved[k] = v
    return Object.fromEntries(Object.entries(saved).filter(([k, v]) => ok(k, v)))
  }
  const save = () => {
    try {
      localStorage.setItem(store, JSON.stringify(tweaks))
    } catch {}
    const q = new URLSearchParams(tweaks).toString()
    history.replaceState(history.state, '', location.pathname + (q ? `?${q}` : '') + location.hash)
  }
  let tweaks = load()
  const values = () => ({
    ...Object.fromEntries(Object.entries(schema).filter(([, d]) => 'default' in d).map(([k, d]) => [k, d.default])),
    ...tweaks,
  })

  function fill(root, vals) {
    const walk = document.createTreeWalker(root, NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT)
    for (let n = walk.nextNode(); n; n = walk.nextNode()) {
      if (n.nodeType === 3) {
        if (n.data.includes('{{')) n.data = n.data.replace(HOLE, (_, p) => lit(vals, p) ?? '')
        continue
      }
      for (const a of [...n.attributes]) {
        if (!a.value.includes('{{')) continue
        const whole = a.value.match(WHOLE)
        if (whole && n.localName === 'x-import') {
          n.raw ??= {}
          n.raw[a.name] = lit(vals, whole[1])
        } else a.value = a.value.replace(HOLE, (_, p) => lit(vals, p) ?? '')
      }
    }
  }

  function attrs(el) {
    const imp = el.localName === 'x-import'
    const p = {}
    for (const a of el.attributes) {
      if (a.name === 'component-from-global-scope') continue
      if (el.raw && a.name in el.raw) p[camel(a.name)] = el.raw[a.name]
      else if (a.name === 'style') p.style = css(a.value)
      else p[NAMES[a.name] ?? (imp ? camel(a.name) : a.name)] = BOOL.has(a.name) || a.value
    }
    return p
  }

  // Узел шаблона → React-элемент; поддеревья без x-import вставляем как есть через innerHTML
  function react(n) {
    if (n.nodeType === 3) return n.data
    if (n.nodeType !== 1) return null
    const h = React.createElement
    const kids = () => [...n.childNodes].map(react)
    if (n.localName === 'x-import') {
      const name = n.getAttribute('component-from-global-scope')
      const C = get(window, name)
      if (!C) console.warn(`x-import: нет компонента ${name}`)
      return C ? h(C, attrs(n), ...kids()) : null
    }
    if (n.querySelector('x-import')) return h(n.localName, attrs(n), ...kids())
    return h(n.localName, VOID.test(n.localName) ? attrs(n) : { ...attrs(n), dangerouslySetInnerHTML: { __html: n.innerHTML } })
  }

  let inst
  let roots = []
  function render() {
    const frag = tpl.content.cloneNode(true)
    fill(frag, inst.renderVals?.() ?? {})
    host.replaceChildren(frag)
    for (const el of host.querySelectorAll('x-import')) {
      if (!el.isConnected || el.parentElement.closest('x-import')) continue
      const vnode = react(el)
      el.replaceChildren()
      const r = ReactDOM.createRoot(el)
      ReactDOM.flushSync(() => r.render(vnode))
      roots.push(r)
    }
  }
  function mount() {
    inst = new Component({ ...tweaks })
    render()
    inst.componentDidMount?.()
  }
  function remount() {
    inst.componentWillUnmount?.()
    for (const r of roots) r.unmount()
    roots = []
    mount()
  }

  // Шаблон без дырок не зависит от props: обновляем как DC — через componentDidUpdate
  const holes = tpl.innerHTML.includes('{{')
  function change() {
    save()
    const prev = inst.props
    if (holes) remount()
    else {
      inst.props = { ...tweaks }
      inst.componentDidUpdate?.(prev, inst.state)
    }
    dispatchEvent(new Event('dc:change'))
  }

  const style = document.createElement('style')
  style.textContent = 'x-import{display:contents!important}'
  document.head.append(style)
  mount()

  window.DCLite = {
    schema,
    values,
    set(k, v) {
      if (!ok(k, v)) return
      tweaks[k] = v
      change()
    },
    reset() {
      tweaks = {}
      change()
    },
  }
})()
