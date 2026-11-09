import { describe, expect, it } from 'vitest'
import {
  loadProducts,
  parseStoredProducts,
  PRODUCTS_BACKUP_KEY,
  PRODUCTS_KEY,
  saveProducts,
} from '../src/storage/products'
import { makeProduct } from './fixtures'

function memoryStorage(initial: Record<string, string> = {}) {
  const data = new Map(Object.entries(initial))
  return {
    data,
    getItem: (key: string) => data.get(key) ?? null,
    setItem: (key: string, value: string) => void data.set(key, value),
  }
}

describe('parseStoredProducts', () => {
  it('пустое хранилище — пустой список без ошибок', () => {
    expect(parseStoredProducts(null)).toEqual({ products: [], skipped: 0, corrupted: false })
  })

  it('читает корректные товары', () => {
    const products = [makeProduct('a'), makeProduct('b', { marketplace: 'ozon' })]
    expect(parseStoredProducts(JSON.stringify(products)).products).toEqual(products)
  })

  it.each(['{не json', '"строка"', '{"a":1}', '42'])('помечает нечитаемые данные как повреждённые: %s', (raw) => {
    expect(parseStoredProducts(raw)).toEqual({ products: [], skipped: 0, corrupted: true })
  })

  it('пропускает отдельные повреждённые записи, сохраняя остальные', () => {
    const good = makeProduct('ok')
    const raw = JSON.stringify([
      good,
      null,
      { id: 'no-input' },
      { ...makeProduct('neg'), input: { ...good.input, sellingPrice: -5 } },
      { ...makeProduct('bad-date'), updatedAt: 'вчера' },
      { ...makeProduct('nan'), input: { ...good.input, tax: 'abc' } },
      { ...makeProduct('bad-commission'), input: { ...good.input, commission: { type: 'tiered' } } },
      makeProduct(''),
    ])
    const result = parseStoredProducts(raw)
    expect(result.products).toEqual([good])
    expect(result.skipped).toBe(7)
    expect(result.corrupted).toBe(false)
  })

  it('отбрасывает дубликаты id', () => {
    const raw = JSON.stringify([makeProduct('x'), makeProduct('x', { productName: 'Другой' })])
    const result = parseStoredProducts(raw)
    expect(result.products).toHaveLength(1)
    expect(result.skipped).toBe(1)
  })
})

describe('loadProducts / saveProducts', () => {
  it('сохраняет и загружает товары', () => {
    const storage = memoryStorage()
    const products = [makeProduct('a')]
    expect(saveProducts(products, storage)).toBe(true)
    expect(loadProducts(storage).products).toEqual(products)
  })

  it('без localStorage сообщает о недоступности', () => {
    expect(loadProducts(null)).toMatchObject({ products: [], unavailable: true })
    expect(saveProducts([], null)).toBe(false)
  })

  it('getItem с исключением (запрет доступа) не роняет приложение', () => {
    const throwing = {
      getItem: () => {
        throw new Error('SecurityError')
      },
    }
    expect(loadProducts(throwing)).toMatchObject({ products: [], unavailable: true })
  })

  it('ошибка записи (переполнение) возвращает false', () => {
    const storage = {
      getItem: () => null,
      setItem: () => {
        throw new Error('QuotaExceededError')
      },
    }
    expect(saveProducts([makeProduct('a')], storage)).toBe(false)
  })

  it('перед перезаписью повреждённых данных делает их резервную копию', () => {
    const storage = memoryStorage({ [PRODUCTS_KEY]: '{битые данные' })
    saveProducts([makeProduct('a')], storage)
    expect(storage.data.get(PRODUCTS_BACKUP_KEY)).toBe('{битые данные')
    expect(loadProducts(storage).products).toHaveLength(1)
  })
})
