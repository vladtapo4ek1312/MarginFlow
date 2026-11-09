import { describe, expect, it } from 'vitest'
import { computePortfolioStats, summarizeByMarketplace } from '../src/calculations/portfolio'
import { DEFAULT_QUERY, queryProducts, withResults } from '../src/utils/products'
import { makeProduct } from './fixtures'

// Базовый товар: прибыль 450 ₽, рентабельность 30 %.
const rows = withResults([
  makeProduct('profit', { productName: 'Футболка белая' }, '2026-01-03T00:00:00.000Z'),
  makeProduct('loss', { productName: 'Худи', sellingPrice: 700, marketplace: 'ozon' }, '2026-01-02T00:00:00.000Z'),
  makeProduct('free', { productName: 'Футболка-подарок', sellingPrice: 0 }, '2026-01-04T00:00:00.000Z'),
])

describe('computePortfolioStats', () => {
  it('нет товаров — нули и неопределённая рентабельность', () => {
    expect(computePortfolioStats([])).toEqual({ count: 0, totalProfit: 0, averageMargin: null, lossCount: 0 })
  })

  it('считает сводку по реальным результатам', () => {
    const stats = computePortfolioStats(rows.map((r) => r.result))
    expect(stats.count).toBe(3)
    // 450 − 190 − 750
    expect(stats.totalProfit).toBe(-490)
    // (30 + (−27,14)) / 2 — товар с нулевой ценой не участвует
    expect(stats.averageMargin).toBe(1.43)
    expect(stats.lossCount).toBe(2)
  })
})

describe('summarizeByMarketplace', () => {
  it('группирует прибыль по маркетплейсам, включая пустые', () => {
    expect(summarizeByMarketplace(rows.map((r) => r.result))).toEqual([
      { marketplace: 'wildberries', count: 2, totalProfit: -300 },
      { marketplace: 'ozon', count: 1, totalProfit: -190 },
    ])
  })
})

describe('queryProducts', () => {
  const ids = (query = DEFAULT_QUERY) => queryProducts(rows, query).map((r) => r.product.id)

  it('по умолчанию сортирует по прибыли по убыванию', () => {
    expect(ids()).toEqual(['profit', 'loss', 'free'])
  })

  it('сортирует по прибыли по возрастанию', () => {
    expect(ids({ ...DEFAULT_QUERY, sort: 'profit-asc' })).toEqual(['free', 'loss', 'profit'])
  })

  it('по рентабельности: неопределённая — в конце', () => {
    expect(ids({ ...DEFAULT_QUERY, sort: 'margin-desc' })).toEqual(['profit', 'loss', 'free'])
  })

  it('по дате изменения', () => {
    expect(ids({ ...DEFAULT_QUERY, sort: 'updated-desc' })).toEqual(['free', 'profit', 'loss'])
  })

  it('ищет по названию без учёта регистра', () => {
    expect(ids({ ...DEFAULT_QUERY, search: '  ФУТБОЛКА ' })).toEqual(['profit', 'free'])
  })

  it('фильтрует по маркетплейсу', () => {
    expect(ids({ ...DEFAULT_QUERY, marketplace: 'ozon' })).toEqual(['loss'])
  })

  it('не изменяет исходный массив', () => {
    const before = rows.map((r) => r.product.id)
    queryProducts(rows, { ...DEFAULT_QUERY, sort: 'profit-asc' })
    expect(rows.map((r) => r.product.id)).toEqual(before)
  })
})
