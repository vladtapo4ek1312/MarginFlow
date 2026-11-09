import { calculateProfit } from '../calculations/profit'
import type { Marketplace } from '../types'
import type { SavedProduct } from '../types/product'
import type { ProfitResult } from '../types/profit'

/** Сохранённый товар вместе с актуальным результатом расчёта. */
export interface ProductWithResult {
  product: SavedProduct
  result: ProfitResult
}

/** Пересчитывает товары. Сохранённые данные уже провалидированы, но некорректные всё равно отбрасываются. */
export function withResults(products: SavedProduct[]): ProductWithResult[] {
  const rows: ProductWithResult[] = []
  for (const product of products) {
    const calculation = calculateProfit(product.input)
    if (calculation.ok) rows.push({ product, result: calculation.result })
  }
  return rows
}

export type MarketplaceFilter = Marketplace | 'all'
export type ProductSort = 'profit-desc' | 'profit-asc' | 'margin-desc' | 'updated-desc'

export interface ProductQuery {
  search: string
  marketplace: MarketplaceFilter
  sort: ProductSort
}

export const DEFAULT_QUERY: ProductQuery = { search: '', marketplace: 'all', sort: 'profit-desc' }

const byMargin = (row: ProductWithResult) => row.result.marginPercent ?? Number.NEGATIVE_INFINITY

const COMPARATORS: Record<ProductSort, (a: ProductWithResult, b: ProductWithResult) => number> = {
  'profit-desc': (a, b) => b.result.netProfit - a.result.netProfit,
  'profit-asc': (a, b) => a.result.netProfit - b.result.netProfit,
  'margin-desc': (a, b) => byMargin(b) - byMargin(a),
  'updated-desc': (a, b) => b.product.updatedAt.localeCompare(a.product.updatedAt),
}

export function queryProducts(rows: ProductWithResult[], query: ProductQuery): ProductWithResult[] {
  const needle = query.search.trim().toLocaleLowerCase('ru-RU')
  return rows
    .filter((row) => query.marketplace === 'all' || row.product.input.marketplace === query.marketplace)
    .filter((row) => needle === '' || row.product.input.productName.toLocaleLowerCase('ru-RU').includes(needle))
    .sort(COMPARATORS[query.sort])
}
