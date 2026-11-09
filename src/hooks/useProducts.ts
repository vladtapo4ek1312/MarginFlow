import { useCallback, useEffect, useState } from 'react'
import { createProductId, loadProducts, PRODUCTS_KEY, saveProducts } from '../storage/products'
import type { SavedProduct } from '../types/product'
import type { ProfitInput } from '../types/profit'

export interface StorageStatus {
  skipped: number
  corrupted: boolean
  unavailable: boolean
  saveFailed: boolean
}

export interface ProductsStore {
  products: SavedProduct[]
  status: StorageStatus
  addProduct: (input: ProfitInput) => SavedProduct
  updateProduct: (id: string, input: ProfitInput) => SavedProduct | null
  deleteProduct: (id: string) => void
}

function normalizeInput(input: ProfitInput): ProfitInput {
  return { ...input, productName: input.productName.trim() }
}

export function useProducts(): ProductsStore {
  const [initial] = useState(() => loadProducts())
  const [products, setProducts] = useState<SavedProduct[]>(initial.products)
  const [status, setStatus] = useState<StorageStatus>({
    skipped: initial.skipped,
    corrupted: initial.corrupted,
    unavailable: initial.unavailable,
    saveFailed: false,
  })

  // Синхронизация между вкладками браузера.
  useEffect(() => {
    const onStorage = (event: StorageEvent) => {
      if (event.key !== PRODUCTS_KEY) return
      const loaded = loadProducts()
      setProducts(loaded.products)
      setStatus((s) => ({ ...s, skipped: loaded.skipped, corrupted: loaded.corrupted }))
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [])

  const commit = useCallback((next: SavedProduct[]) => {
    setProducts(next)
    const ok = saveProducts(next)
    setStatus((s) => (ok ? { ...s, saveFailed: false, corrupted: false, skipped: 0 } : { ...s, saveFailed: true }))
  }, [])

  const addProduct = useCallback(
    (input: ProfitInput) => {
      const now = new Date().toISOString()
      const product: SavedProduct = { id: createProductId(), input: normalizeInput(input), createdAt: now, updatedAt: now }
      commit([product, ...products])
      return product
    },
    [commit, products],
  )

  const updateProduct = useCallback(
    (id: string, input: ProfitInput) => {
      const existing = products.find((p) => p.id === id)
      if (!existing) return null
      const updated: SavedProduct = { ...existing, input: normalizeInput(input), updatedAt: new Date().toISOString() }
      commit(products.map((p) => (p.id === id ? updated : p)))
      return updated
    },
    [commit, products],
  )

  const deleteProduct = useCallback(
    (id: string) => commit(products.filter((p) => p.id !== id)),
    [commit, products],
  )

  return { products, status, addProduct, updateProduct, deleteProduct }
}
