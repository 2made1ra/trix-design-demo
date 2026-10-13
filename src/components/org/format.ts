// Склонение по числу: plural(5, 'приглашение', 'приглашения', 'приглашений') → «приглашений».
export const plural = (n: number, one: string, few: string, many: string) => {
  const mod10 = n % 10
  const mod100 = n % 100
  if (mod10 === 1 && mod100 !== 11) return one
  return mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14) ? few : many
}

export const DEMO_FILE_NAME = 'спикеры_2026.xlsx'
const DEMO_FILE_BYTES = 48 * 1024

/** Файл для демо: клик по «Выбрать файл» без своего файла подставляет его. */
export const demoFile = () =>
  new File([new Uint8Array(DEMO_FILE_BYTES)], DEMO_FILE_NAME, {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  })
