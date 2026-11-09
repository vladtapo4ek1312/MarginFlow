import { formatRub } from '../calculations/money'

export { formatRub }

const percentFormatter = new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 2 })

/** «27,14 %». Для null возвращает прочерк — значение не определено. */
export function formatPercent(value: number | null): string {
  if (value === null || !Number.isFinite(value)) return '—'
  return `${percentFormatter.format(value)} %`
}

/** Сумма со знаком: «+450 ₽», «−190 ₽». */
export function formatSignedRub(value: number): string {
  if (value > 0) return `+${formatRub(value)}`
  return formatRub(value)
}

/** CSS-модификатор для окраски прибыли/убытка. */
export function toneOf(value: number | null): 'positive' | 'negative' | 'neutral' {
  if (value === null || value === 0) return 'neutral'
  return value > 0 ? 'positive' : 'negative'
}

const pluralRules = new Intl.PluralRules('ru-RU')

/** Склонение по числу: pluralize(3, { one: 'товар', few: 'товара', many: 'товаров' }) → «товара». */
export function pluralize(count: number, forms: { one: string; few: string; many: string }): string {
  const category = pluralRules.select(count)
  if (category === 'one') return forms.one
  if (category === 'few') return forms.few
  return forms.many
}

const dateFormatter = new Intl.DateTimeFormat('ru-RU', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
})

export function formatDate(iso: string): string {
  return dateFormatter.format(new Date(iso))
}
