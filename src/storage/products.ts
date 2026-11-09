import { validateProfitInput } from '../calculations/profit'
import type { SavedProduct } from '../types/product'
import type { ProfitInput } from '../types/profit'
import { storageKey } from './index'

export const PRODUCTS_KEY = storageKey('products:v1')
/** Сюда копируются нечитаемые данные, прежде чем их перезапишут. */
export const PRODUCTS_BACKUP_KEY = storageKey('products:v1:corrupted-backup')

type ReadableStorage = Pick<Storage, 'getItem'>
type WritableStorage = Pick<Storage, 'getItem' | 'setItem'>

export interface LoadProductsResult {
  products: SavedProduct[]
  /** Сколько записей пропущено как повреждённые. */
  skipped: number
  /** Данные не удалось прочитать целиком (не JSON или не массив). */
  corrupted: boolean
  /** localStorage недоступен (приватный режим, запрет cookies). */
  unavailable: boolean
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function isIsoDate(value: unknown): value is string {
  return typeof value === 'string' && !Number.isNaN(Date.parse(value))
}

/** Возвращает товар, только если запись полностью корректна. */
export function parseSavedProduct(value: unknown): SavedProduct | null {
  if (!isRecord(value) || !isRecord(value.input)) return null
  if (typeof value.id !== 'string' || value.id.length === 0) return null
  if (!isIsoDate(value.createdAt) || !isIsoDate(value.updatedAt)) return null

  const input = value.input as unknown as ProfitInput
  try {
    if (validateProfitInput(input).length > 0) return null
  } catch {
    return null
  }

  return { id: value.id, input, createdAt: value.createdAt, updatedAt: value.updatedAt }
}

export function parseStoredProducts(raw: string | null): Omit<LoadProductsResult, 'unavailable'> {
  if (raw === null) return { products: [], skipped: 0, corrupted: false }

  let data: unknown
  try {
    data = JSON.parse(raw)
  } catch {
    return { products: [], skipped: 0, corrupted: true }
  }
  if (!Array.isArray(data)) return { products: [], skipped: 0, corrupted: true }

  const products: SavedProduct[] = []
  const seenIds = new Set<string>()
  for (const item of data) {
    const product = parseSavedProduct(item)
    if (product && !seenIds.has(product.id)) {
      seenIds.add(product.id)
      products.push(product)
    }
  }
  return { products, skipped: data.length - products.length, corrupted: false }
}

export function getBrowserStorage(): Storage | null {
  try {
    return typeof window === 'undefined' ? null : window.localStorage
  } catch {
    return null
  }
}

export function loadProducts(storage: ReadableStorage | null = getBrowserStorage()): LoadProductsResult {
  if (!storage) return { products: [], skipped: 0, corrupted: false, unavailable: true }
  try {
    return { ...parseStoredProducts(storage.getItem(PRODUCTS_KEY)), unavailable: false }
  } catch {
    return { products: [], skipped: 0, corrupted: false, unavailable: true }
  }
}

/** Сохраняет список товаров. Возвращает false, если запись не удалась (например, переполнено хранилище). */
export function saveProducts(
  products: SavedProduct[],
  storage: WritableStorage | null = getBrowserStorage(),
): boolean {
  if (!storage) return false
  try {
    const current = storage.getItem(PRODUCTS_KEY)
    if (current !== null && parseStoredProducts(current).corrupted) {
      storage.setItem(PRODUCTS_BACKUP_KEY, current)
    }
    storage.setItem(PRODUCTS_KEY, JSON.stringify(products))
    return true
  } catch {
    return false
  }
}

export function createProductId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`
}
