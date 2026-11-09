import type { SavedProduct } from '../src/types/product'
import type { ProfitInput } from '../src/types/profit'

export const sampleInput: ProfitInput = {
  marketplace: 'wildberries',
  productName: 'Футболка',
  sellingPrice: 1500,
  purchaseCost: 500,
  commission: { type: 'percent', rate: 20, base: { kind: 'sellingPrice' } },
  logistics: 80,
  storage: 10,
  packaging: 15,
  advertising: 50,
  tax: 90,
  otherExpenses: 5,
}

export function makeProduct(id: string, overrides: Partial<ProfitInput> = {}, updatedAt = '2026-01-01T00:00:00.000Z'): SavedProduct {
  return {
    id,
    input: { ...sampleInput, ...overrides },
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt,
  }
}
