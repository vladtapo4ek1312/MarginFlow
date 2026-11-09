import { MARKETPLACE_LABELS } from '../types'
import type {
  Commission,
  ExpenseBreakdown,
  ProfitCalculation,
  ProfitInput,
  ProfitInputField,
  ProfitResult,
  ProfitStatus,
  ValidationIssue,
} from '../types/profit'
import { ceilToKopecks, roundTo, roundToKopecks } from './money'

/** Статьи расходов, которые не зависят от цены продажи. */
const FLAT_EXPENSE_FIELDS = [
  'logistics',
  'storage',
  'packaging',
  'advertising',
  'tax',
  'otherExpenses',
] as const satisfies readonly (keyof ProfitInput & keyof ExpenseBreakdown)[]

const MAX_PERCENT = 100

function checkAmount(value: unknown, field: ProfitInputField, errors: ValidationIssue[]): void {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    errors.push({ field, message: 'Введите число' })
  } else if (value < 0) {
    errors.push({ field, message: 'Значение не может быть отрицательным' })
  }
}

function checkCommission(commission: unknown, errors: ValidationIssue[]): void {
  if (typeof commission !== 'object' || commission === null) {
    errors.push({ field: 'commission', message: 'Укажите комиссию' })
    return
  }

  const c = commission as Partial<Commission>
  if (c.type === 'fixed') {
    checkAmount(c.amount, 'commission.amount', errors)
    return
  }
  if (c.type !== 'percent') {
    errors.push({ field: 'commission', message: 'Неизвестный тип комиссии' })
    return
  }

  const { rate, base } = c
  if (typeof rate !== 'number' || !Number.isFinite(rate)) {
    errors.push({ field: 'commission.rate', message: 'Введите число' })
  } else if (rate < 0 || rate > MAX_PERCENT) {
    errors.push({ field: 'commission.rate', message: 'Процент должен быть от 0 до 100' })
  }

  if (typeof base !== 'object' || base === null) {
    errors.push({ field: 'commission.base', message: 'Укажите базу расчёта комиссии' })
  } else if (base.kind === 'custom') {
    checkAmount(base.amount, 'commission.base.amount', errors)
  } else if (base.kind !== 'sellingPrice' && base.kind !== 'purchaseCost') {
    errors.push({ field: 'commission.base', message: 'Неизвестная база расчёта комиссии' })
  }
}

/**
 * Проверяет входные данные. Не доверяет типам: значения из формы
 * могут оказаться NaN, Infinity или отрицательными.
 */
export function validateProfitInput(input: ProfitInput): ValidationIssue[] {
  const errors: ValidationIssue[] = []

  if (typeof input.marketplace !== 'string' || !Object.hasOwn(MARKETPLACE_LABELS, input.marketplace)) {
    errors.push({ field: 'marketplace', message: 'Выберите маркетплейс' })
  }
  if (typeof input.productName !== 'string') {
    errors.push({ field: 'productName', message: 'Название товара должно быть строкой' })
  }

  checkAmount(input.sellingPrice, 'sellingPrice', errors)
  checkAmount(input.purchaseCost, 'purchaseCost', errors)
  checkCommission(input.commission, errors)
  for (const field of FLAT_EXPENSE_FIELDS) {
    checkAmount(input[field], field, errors)
  }

  return errors
}

/** Комиссия маркетплейса в рублях. Ставки всегда приходят от пользователя. */
export function calculateCommission(
  commission: Commission,
  sellingPrice: number,
  purchaseCost: number,
): number {
  if (commission.type === 'fixed') {
    return roundToKopecks(commission.amount)
  }

  const baseAmount =
    commission.base.kind === 'sellingPrice'
      ? sellingPrice
      : commission.base.kind === 'purchaseCost'
        ? purchaseCost
        : commission.base.amount

  return roundToKopecks((baseAmount * commission.rate) / 100)
}

/**
 * Минимальная цена продажи (с точностью до копейки), при которой прибыль ≥ 0.
 *
 * Если комиссия — процент от цены продажи, она растёт вместе с ценой:
 *   P − P·r − C = 0  ⇒  P = C / (1 − r),
 * где C — все расходы, кроме комиссии. Иначе комиссия постоянна и P = C + комиссия.
 * Налог задан суммой, поэтому считается постоянным расходом.
 */
export function calculateBreakEvenPrice(
  commission: Commission,
  costsExcludingCommission: number,
  commissionAmount: number,
): number | null {
  const dependsOnPrice = commission.type === 'percent' && commission.base.kind === 'sellingPrice'
  if (!dependsOnPrice) {
    return ceilToKopecks(costsExcludingCommission + commissionAmount)
  }

  const shareLeft = 1 - commission.rate / 100
  if (shareLeft <= 0) {
    // Комиссия забирает всю выручку: окупиться можно только при нулевых расходах.
    return costsExcludingCommission === 0 ? 0 : null
  }

  // Комиссия округляется до копеек, поэтому формула даёт лишь приближение:
  // при высокой ставке несколько соседних цен дают одинаковую прибыль.
  // Прибыль не убывает с ростом цены, так что ищем минимум бинарным поиском по копейкам.
  const profitInKopecks = (kopecks: number) =>
    Math.round(
      (kopecks / 100 - calculateCommission(commission, kopecks / 100, 0) - costsExcludingCommission) * 100,
    )

  let high = Math.round(ceilToKopecks(costsExcludingCommission / shareLeft) * 100)
  while (profitInKopecks(high) < 0) high += 1
  let low = 0
  while (low < high) {
    const mid = Math.floor((low + high) / 2)
    if (profitInKopecks(mid) >= 0) high = mid
    else low = mid + 1
  }
  return high / 100
}

function percentOf(value: number, base: number): number | null {
  return base === 0 ? null : roundTo((value / base) * 100, 2)
}

function statusOf(netProfit: number): ProfitStatus {
  if (netProfit > 0) return 'profit'
  if (netProfit < 0) return 'loss'
  return 'breakeven'
}

/** Считает прибыль с одной продажи. При некорректных данных возвращает список ошибок. */
export function calculateProfit(input: ProfitInput): ProfitCalculation {
  const errors = validateProfitInput(input)
  if (errors.length > 0) {
    return { ok: false, errors }
  }

  const sellingPrice = roundToKopecks(input.sellingPrice)
  const purchaseCost = roundToKopecks(input.purchaseCost)
  const commission = calculateCommission(input.commission, sellingPrice, purchaseCost)

  const expenses: ExpenseBreakdown = {
    purchaseCost,
    commission,
    logistics: roundToKopecks(input.logistics),
    storage: roundToKopecks(input.storage),
    packaging: roundToKopecks(input.packaging),
    advertising: roundToKopecks(input.advertising),
    tax: roundToKopecks(input.tax),
    otherExpenses: roundToKopecks(input.otherExpenses),
  }

  const totalExpenses = roundToKopecks(
    Object.values(expenses).reduce((sum, amount) => sum + amount, 0),
  )
  const netProfit = roundToKopecks(sellingPrice - totalExpenses)

  const result: ProfitResult = {
    marketplace: input.marketplace,
    productName: input.productName.trim(),
    sellingPrice,
    expenses,
    totalExpenses,
    netProfit,
    marginPercent: percentOf(netProfit, sellingPrice),
    markupPercent: percentOf(sellingPrice - purchaseCost, purchaseCost),
    breakEvenPrice: calculateBreakEvenPrice(
      input.commission,
      roundToKopecks(totalExpenses - commission),
      commission,
    ),
    status: statusOf(netProfit),
  }

  return { ok: true, result }
}
