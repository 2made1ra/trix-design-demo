// Мини-рантайм макетов с холста: шаблон из <template id="dc-tpl">, класс Component из data-dc-script,
// {{дырки}} и Tweaks из data-props. Общие Tweaks (shared) живут в localStorage по ключу prefix + имя:
// оттуда их читают доски, поэтому они одинаковы на всех страницах.
// Наружу: window.DCLite = { schema, values(), defaults(), set(key, value), reset(keys?) } и событие 'dc:change' на window.
;(() => {
  const tpl = document.getElementById('dc-tpl')
  const host = document.getElementById('dc')
  const tag = document.querySelector('script[data-dc-script]')
  const { shared } = JSON.parse(document.getElementById('demo-meta').textContent)
  const { $preview, ...own } = JSON.parse(tag.getAttribute('data-props') || '{}')
  const schema = Object.fromEntries(Object.entries(shared.schema).map(([k, d]) => [k, { ...d, shared: true }]))
  for (const [k, d] of Object.entries(own)) schema[k] ??= d
  const store = `dc:${location.pathname}`
  const HOLE = /\{\{\s*([\w$.]+)\s*\}\}/g

  const get = (o, path) => path.split('.').reduce((v, k) => v?.[k], o)
  const lit = (vals, p) => (p === 'true' ? true : p === 'false' ? false : /^-?\d/.test(p) ? Number(p) : get(vals, p))
  const ls = (k, v) => {
    try {
      return v === undefined ? localStorage.getItem(k) : localStorage.setItem(k, v)
    } catch {}
  }

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
  // Значения: ссылка важнее сохранённых в браузере, неизвестные опции отбрасываем
  const ok = (k, v) => k in schema && (!schema[k].options || schema[k].editor === 'color' || schema[k].options.includes(v))
  const defaults = () => Object.fromEntries(Object.entries(schema).filter(([, d]) => 'default' in d).map(([k, d]) => [k, d.default]))
  const common = () => Object.fromEntries(Object.keys(shared.schema).map(k => [k, ls(shared.prefix + k)]).filter(([k, v]) => ok(k, v)))
  let tweaks = {}
  try {
    tweaks = JSON.parse(localStorage.getItem(store)) ?? {}
  } catch {}
  for (const [k, v] of new URLSearchParams(location.search)) tweaks[k] = v
  tweaks = Object.fromEntries(Object.entries(tweaks).filter(([k, v]) => ok(k, v)))
  // Общие храним только у досок: без записи доска взяла бы свой встроенный default, а не значение главной
  for (const [k, d] of Object.entries(shared.schema)) {
    if (k in tweaks) ls(shared.prefix + k, tweaks[k])
    else if (!ok(k, ls(shared.prefix + k))) ls(shared.prefix + k, d.default)
    delete tweaks[k]
  }
  const values = () => ({ ...defaults(), ...common(), ...tweaks })
  const props = () => ({ ...common(), ...tweaks })
  const save = () => {
    try {
      localStorage.setItem(store, JSON.stringify(tweaks))
    } catch {}
    const d = defaults()
    const q = new URLSearchParams(Object.entries(values()).filter(([k, v]) => v !== d[k])).toString()
    history.replaceState(history.state, '', location.pathname + (q ? `?${q}` : '') + location.hash)
  }

  function fill(root, vals) {
    const walk = document.createTreeWalker(root, NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT)
    for (let n = walk.nextNode(); n; n = walk.nextNode()) {
      if (n.nodeType === 3) {
        if (n.data.includes('{{')) n.data = n.data.replace(HOLE, (_, p) => lit(vals, p) ?? '')
        continue
      }
      for (const a of n.attributes) if (a.value.includes('{{')) a.value = a.value.replace(HOLE, (_, p) => lit(vals, p) ?? '')
    }
  }

  let inst
  function mount() {
    inst = new Component(props())
    const frag = tpl.content.cloneNode(true)
    fill(frag, inst.renderVals?.() ?? {})
    host.replaceChildren(frag)
    inst.componentDidMount?.()
  }
  function remount() {
    inst.componentWillUnmount?.()
    mount()
  }

  // Шаблон без дырок не зависит от props: обновляем как DC — через componentDidUpdate
  const holes = tpl.innerHTML.includes('{{')
  function change() {
    save()
    const prev = inst.props
    if (holes) remount()
    else {
      inst.props = props()
      inst.componentDidUpdate?.(prev, inst.state)
    }
    dispatchEvent(new Event('dc:change'))
  }
  const put = (k, v) => (schema[k].shared ? ls(shared.prefix + k, v) : v === schema[k].default ? delete tweaks[k] : (tweaks[k] = v))

  mount()
  save()

  window.DCLite = {
    schema,
    values,
    defaults,
    set(k, v) {
      if (!ok(k, v)) return
      put(k, v)
      change()
    },
    reset(keys = Object.keys(schema)) {
      for (const k of keys) if ('default' in schema[k]) put(k, schema[k].default)
      change()
    },
  }
})()
