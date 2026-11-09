/** Базовые денежные утилиты. */

// toFixed(6) отсекает «хвосты» плавающей точки: 1.005 * 100 = 100.49999999999999.
function scaleClean(value: number, factor: number): number {
  return Number((value * factor).toFixed(6))
}

function normalizeZero(value: number): number {
  return value === 0 ? 0 : value
}

/**
 * Округляет до `decimals` знаков по правилу «половина — от нуля»,
 * одинаково для прибыли и убытка: 1.005 → 1.01, −1.005 → −1.01.
 */
export function roundTo(value: number, decimals: number): number {
  const factor = 10 ** decimals
  const rounded = (Math.sign(value) * Math.round(scaleClean(Math.abs(value), factor))) / factor
  return normalizeZero(rounded)
}

/** Округляет сумму в рублях до копеек. */
export function roundToKopecks(value: number): number {
  return roundTo(value, 2)
}

/** Округляет сумму в рублях вверх до копейки (для цен, ниже которых нельзя опускаться). */
export function ceilToKopecks(value: number): number {
  return normalizeZero(Math.ceil(scaleClean(value, 100)) / 100)
}

const rubFormatter = new Intl.NumberFormat('ru-RU', {
  style: 'currency',
  currency: 'RUB',
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
})

/** Форматирует сумму в рублях для отображения: «1 234,5 ₽». */
export function formatRub(value: number): string {
  return rubFormatter.format(roundToKopecks(value))
}
