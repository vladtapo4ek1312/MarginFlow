import type { Marketplace } from './index'

/** От какой суммы считается процентная комиссия. */
export type CommissionBase =
  | { kind: 'sellingPrice' }
  | { kind: 'purchaseCost' }
  /** Произвольная база в рублях, например цена до скидки. */
  | { kind: 'custom'; amount: number }

export type Commission =
  | { type: 'fixed'; amount: number }
  /** rate — проценты, 0–100 (15 означает 15 %). */
  | { type: 'percent'; rate: number; base: CommissionBase }

/** Все суммы — в рублях за одну продажу. */
export interface ProfitInput {
  marketplace: Marketplace
  productName: string
  sellingPrice: number
  purchaseCost: number
  commission: Commission
  logistics: number
  storage: number
  packaging: number
  advertising: number
  /** Налог вводится вручную суммой в рублях. */
  tax: number
  otherExpenses: number
}

export interface ExpenseBreakdown {
  purchaseCost: number
  commission: number
  logistics: number
  storage: number
  packaging: number
  advertising: number
  tax: number
  otherExpenses: number
}

export type ProfitStatus = 'profit' | 'loss' | 'breakeven'

export interface ProfitResult {
  marketplace: Marketplace
  productName: string
  sellingPrice: number
  expenses: ExpenseBreakdown
  totalExpenses: number
  netProfit: number
  /** null, если цена продажи равна нулю. */
  marginPercent: number | null
  /** null, если закупочная стоимость равна нулю. */
  markupPercent: number | null
  /** null, если безубыточность недостижима (комиссия 100 % от цены продажи). */
  breakEvenPrice: number | null
  status: ProfitStatus
}

export type ProfitInputField =
  | 'marketplace'
  | 'productName'
  | 'sellingPrice'
  | 'purchaseCost'
  | 'commission'
  | 'commission.amount'
  | 'commission.rate'
  | 'commission.base'
  | 'commission.base.amount'
  | 'logistics'
  | 'storage'
  | 'packaging'
  | 'advertising'
  | 'tax'
  | 'otherExpenses'

export interface ValidationIssue {
  field: ProfitInputField
  message: string
}

export type ProfitCalculation =
  | { ok: true; result: ProfitResult }
  | { ok: false; errors: ValidationIssue[] }
