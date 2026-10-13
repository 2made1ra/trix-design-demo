import type { ClassValue } from 'clsx'
import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

const translit: Record<string, string> = {
  а: 'a',
  б: 'b',
  в: 'v',
  г: 'g',
  д: 'd',
  е: 'e',
  ё: 'e',
  ж: 'zh',
  з: 'z',
  и: 'i',
  й: 'y',
  к: 'k',
  л: 'l',
  м: 'm',
  н: 'n',
  о: 'o',
  п: 'p',
  р: 'r',
  с: 's',
  т: 't',
  у: 'u',
  ф: 'f',
  х: 'h',
  ц: 'ts',
  ч: 'ch',
  ш: 'sh',
  щ: 'sch',
  ъ: '',
  ы: 'y',
  ь: '',
  э: 'e',
  ю: 'yu',
  я: 'ya',
}

// Поле ввода дизайн-схемы поверх shadcn Input и Textarea.
export const fieldClass =
  'field-sizing-fixed h-12.5 rounded-xs bg-paper-2 px-4 text-[15px] shadow-none data-[size=default]:h-12.5 md:text-[15px] focus-visible:border-mint focus-visible:shadow-[inset_0_0_0_1px_var(--uv)] focus-visible:ring-0'

// Ключ для адреса: латиница в нижнем регистре, цифры и одиночные дефисы между словами.
export const slugify = (value: string, max = 255) =>
  [...value.toLowerCase()]
    .map((char) => translit[char] ?? char)
    .join('')
    .replace(/[^a-z0-9]+/g, '-')
    .slice(0, max)
    .replace(/^-+|-+$/g, '')
