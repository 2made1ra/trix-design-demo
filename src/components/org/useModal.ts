import { onBeforeUnmount, onMounted, type Ref } from 'vue'

const FOCUSABLE =
  'a[href], button:not(:disabled), input:not(:disabled), select:not(:disabled), textarea:not(:disabled), [tabindex]:not([tabindex="-1"])'

// Фокус не выходит за пределы окна, Esc вызывает onEscape, по закрытии фокус возвращается на кнопку, открывшую окно.
// scope отдаёт контейнер, внутри которого сейчас держим фокус: вложенный диалог перекрывает окно.
export const useModal = (scope: () => HTMLElement | null, onEscape: () => void, initial?: Ref<HTMLElement | null>) => {
  let opener: Element | null = null

  const onKey = (event: KeyboardEvent) => {
    if (event.key === 'Escape') {
      event.preventDefault()
      onEscape()
      return
    }
    const root = scope()
    if (event.key !== 'Tab' || !root) return
    const items = [...root.querySelectorAll<HTMLElement>(FOCUSABLE)].filter((item) => item.offsetParent !== null)
    const [first, last] = [items[0], items[items.length - 1]]
    if (!first || !last) {
      event.preventDefault()
      return
    }
    if (!root.contains(document.activeElement)) {
      event.preventDefault()
      first.focus()
    } else if (event.shiftKey && document.activeElement === first) {
      event.preventDefault()
      last.focus()
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault()
      first.focus()
    }
  }

  onMounted(() => {
    opener = document.activeElement
    document.addEventListener('keydown', onKey)
    initial?.value?.focus({ preventScroll: true })
  })

  onBeforeUnmount(() => {
    document.removeEventListener('keydown', onKey)
    if (opener instanceof HTMLElement) opener.focus({ preventScroll: true })
  })
}
