import { describe, expect, it } from 'vitest'
import { formatPercent, formatSignedRub, pluralize, toneOf } from '../src/utils/format'
import { parseHash, routeToHash, type Route } from '../src/utils/route'

const normalize = (s: string) => s.replace(/[  ]/g, ' ')

describe('маршруты', () => {
  it.each<[string, Route]>([
    ['', { page: 'overview' }],
    ['#/', { page: 'overview' }],
    ['#/unknown', { page: 'overview' }],
    ['#/calculator', { page: 'calculator' }],
    ['#/calculator/edit/abc-1', { page: 'calculator', editId: 'abc-1' }],
    ['#/products', { page: 'products' }],
    ['#/products/abc-1', { page: 'products', selectedId: 'abc-1' }],
  ])('%s', (hash, route) => {
    expect(parseHash(hash)).toEqual(route)
  })

  it('routeToHash и parseHash взаимно обратны', () => {
    const routes: Route[] = [
      { page: 'overview' },
      { page: 'calculator' },
      { page: 'calculator', editId: 'id/с пробелом' },
      { page: 'products', selectedId: 'x' },
    ]
    for (const route of routes) expect(parseHash(routeToHash(route))).toEqual(route)
  })

  it('не падает на некорректном URI', () => {
    expect(parseHash('#/products/%E0%A4%A')).toEqual({ page: 'products', selectedId: '%E0%A4%A' })
  })
})

describe('форматирование', () => {
  it('formatPercent не показывает NaN и Infinity', () => {
    expect(normalize(formatPercent(27.14))).toBe('27,14 %')
    expect(formatPercent(null)).toBe('—')
    expect(formatPercent(Number.NaN)).toBe('—')
    expect(formatPercent(Infinity)).toBe('—')
  })

  it('formatSignedRub добавляет плюс к прибыли', () => {
    expect(normalize(formatSignedRub(450))).toBe('+450 ₽')
    expect(normalize(formatSignedRub(-190))).toMatch(/^[-−]190 ₽$/)
    expect(normalize(formatSignedRub(0))).toBe('0 ₽')
  })

  it('toneOf', () => {
    expect(toneOf(1)).toBe('positive')
    expect(toneOf(-1)).toBe('negative')
    expect(toneOf(0)).toBe('neutral')
    expect(toneOf(null)).toBe('neutral')
  })

  it.each([
    [1, 'товар'],
    [3, 'товара'],
    [5, 'товаров'],
    [11, 'товаров'],
    [21, 'товар'],
    [22, 'товара'],
  ])('pluralize(%i)', (count, expected) => {
    expect(pluralize(count, { one: 'товар', few: 'товара', many: 'товаров' })).toBe(expected)
  })
})
