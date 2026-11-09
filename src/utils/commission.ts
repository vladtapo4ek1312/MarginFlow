import type { Commission } from '../types/profit'

const BASE_LABELS = {
  sellingPrice: 'от цены продажи',
  purchaseCost: 'от закупочной цены',
  custom: 'от суммы',
} as const

/** «15 % от цены продажи», «Фиксированная, 250 ₽». Форматирование сумм передаётся снаружи. */
export function describeCommission(commission: Commission, formatAmount: (value: number) => string): string {
  if (commission.type === 'fixed') return `Фиксированная, ${formatAmount(commission.amount)}`
  const { base } = commission
  const extra = base.kind === 'custom' ? ` ${formatAmount(base.amount)}` : ''
  return `${String(commission.rate).replace('.', ',')} % ${BASE_LABELS[base.kind]}${extra}`
}
