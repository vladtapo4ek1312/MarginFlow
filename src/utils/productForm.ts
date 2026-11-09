import type { Marketplace } from '../types'
import type { CommissionBase, ProfitInput, ProfitInputField, ValidationIssue } from '../types/profit'

/**
 * Состояние формы калькулятора. Числа хранятся строками, чтобы пользователь
 * мог свободно вводить «1 200,50» и временно оставлять поле пустым.
 */
export interface ProductFormValues {
  productName: string
  marketplace: Marketplace
  sellingPrice: string
  purchaseCost: string
  commissionType: 'fixed' | 'percent'
  commissionAmount: string
  commissionRate: string
  commissionBase: CommissionBase['kind']
  commissionBaseAmount: string
  logistics: string
  storage: string
  packaging: string
  advertising: string
  tax: string
  otherExpenses: string
}

export type ProductFormField = keyof ProductFormValues
export type FormErrors = Partial<Record<ProductFormField, string>>

export const EXPENSE_FIELDS = [
  'logistics',
  'storage',
  'packaging',
  'advertising',
  'tax',
  'otherExpenses',
] as const satisfies readonly ProductFormField[]

export function emptyFormValues(): ProductFormValues {
  return {
    productName: '',
    marketplace: 'wildberries',
    sellingPrice: '',
    purchaseCost: '',
    commissionType: 'percent',
    commissionAmount: '',
    commissionRate: '',
    commissionBase: 'sellingPrice',
    commissionBaseAmount: '',
    logistics: '',
    storage: '',
    packaging: '',
    advertising: '',
    tax: '',
    otherExpenses: '',
  }
}

const DECIMAL_PATTERN = /^-?(\d+([.,]\d*)?|[.,]\d+)$/

/**
 * Разбирает число в русском формате: пробелы-разделители тысяч, запятая или точка.
 * Пустая строка → null, мусор → NaN (движок расчёта сообщит об ошибке).
 */
export function parseDecimal(raw: string): number | null {
  const compact = raw.replace(/[\s  ]/g, '').replace('−', '-')
  if (compact === '') return null
  if (!DECIMAL_PATTERN.test(compact)) return Number.NaN
  return Number(compact.replace(',', '.'))
}

/** Обязательные поля пустыми быть не могут; необязательные расходы по умолчанию равны нулю. */
function required(raw: string): number {
  return parseDecimal(raw) ?? Number.NaN
}

function optional(raw: string): number {
  return parseDecimal(raw) ?? 0
}

export function formToInput(values: ProductFormValues): ProfitInput {
  const base: CommissionBase =
    values.commissionBase === 'custom'
      ? { kind: 'custom', amount: required(values.commissionBaseAmount) }
      : { kind: values.commissionBase }

  return {
    marketplace: values.marketplace,
    productName: values.productName,
    sellingPrice: required(values.sellingPrice),
    purchaseCost: required(values.purchaseCost),
    commission:
      values.commissionType === 'fixed'
        ? { type: 'fixed', amount: required(values.commissionAmount) }
        : { type: 'percent', rate: required(values.commissionRate), base },
    logistics: optional(values.logistics),
    storage: optional(values.storage),
    packaging: optional(values.packaging),
    advertising: optional(values.advertising),
    tax: optional(values.tax),
    otherExpenses: optional(values.otherExpenses),
  }
}

function toField(value: number): string {
  return String(value).replace('.', ',')
}

export function inputToForm(input: ProfitInput): ProductFormValues {
  const values: ProductFormValues = {
    ...emptyFormValues(),
    productName: input.productName,
    marketplace: input.marketplace,
    sellingPrice: toField(input.sellingPrice),
    purchaseCost: toField(input.purchaseCost),
    logistics: toField(input.logistics),
    storage: toField(input.storage),
    packaging: toField(input.packaging),
    advertising: toField(input.advertising),
    tax: toField(input.tax),
    otherExpenses: toField(input.otherExpenses),
  }

  if (input.commission.type === 'fixed') {
    values.commissionType = 'fixed'
    values.commissionAmount = toField(input.commission.amount)
  } else {
    values.commissionType = 'percent'
    values.commissionRate = toField(input.commission.rate)
    values.commissionBase = input.commission.base.kind
    if (input.commission.base.kind === 'custom') {
      values.commissionBaseAmount = toField(input.commission.base.amount)
    }
  }
  return values
}

export const FIELD_LABELS: Record<ProductFormField, string> = {
  productName: 'Название товара',
  marketplace: 'Маркетплейс',
  sellingPrice: 'Цена продажи',
  purchaseCost: 'Закупочная цена',
  commissionType: 'Тип комиссии',
  commissionAmount: 'Сумма комиссии',
  commissionRate: 'Ставка комиссии',
  commissionBase: 'База расчёта комиссии',
  commissionBaseAmount: 'Сумма для расчёта комиссии',
  logistics: 'Логистика',
  storage: 'Хранение',
  packaging: 'Упаковка',
  advertising: 'Реклама',
  tax: 'Налог',
  otherExpenses: 'Прочие расходы',
}

const FIELD_MAP: Record<ProfitInputField, ProductFormField> = {
  marketplace: 'marketplace',
  productName: 'productName',
  sellingPrice: 'sellingPrice',
  purchaseCost: 'purchaseCost',
  commission: 'commissionType',
  'commission.amount': 'commissionAmount',
  'commission.rate': 'commissionRate',
  'commission.base': 'commissionBase',
  'commission.base.amount': 'commissionBaseAmount',
  logistics: 'logistics',
  storage: 'storage',
  packaging: 'packaging',
  advertising: 'advertising',
  tax: 'tax',
  otherExpenses: 'otherExpenses',
}

/** Переносит ошибки движка на поля формы; для пустых обязательных полей — понятнее сообщение. */
export function mapErrorsToForm(errors: ValidationIssue[], values: ProductFormValues): FormErrors {
  const result: FormErrors = {}
  for (const { field, message } of errors) {
    const formField = FIELD_MAP[field]
    if (result[formField]) continue
    const raw = values[formField]
    result[formField] = raw.trim() === '' ? 'Заполните поле' : message
  }
  return result
}

/** Название нужно только для сохранения — считать можно и без него. */
export function validateForSave(values: ProductFormValues): FormErrors {
  return values.productName.trim() === '' ? { productName: 'Введите название товара' } : {}
}
