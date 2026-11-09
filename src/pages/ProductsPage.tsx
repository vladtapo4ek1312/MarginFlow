import { useEffect, useMemo, useRef, useState } from 'react'
import { PageHeader } from '../components/layout/PageHeader'
import { ProductDetails } from '../components/products/ProductDetails'
import { ProductList } from '../components/products/ProductList'
import { ProductsToolbar } from '../components/products/ProductsToolbar'
import { EmptyState } from '../components/ui/EmptyState'
import { Icon } from '../components/ui/Icon'
import { buildProductsCsv, csvFileName, downloadCsv } from '../utils/csv'
import { DEFAULT_QUERY, queryProducts, type ProductQuery, type ProductWithResult } from '../utils/products'

interface ProductsPageProps {
  rows: ProductWithResult[]
  selectedId?: string
  onSelect: (id: string | undefined) => void
  onEdit: (id: string) => void
  onDelete: (id: string) => void
  onCreate: () => void
}

export function ProductsPage({ rows, selectedId, onSelect, onEdit, onDelete, onCreate }: ProductsPageProps) {
  const [query, setQuery] = useState<ProductQuery>(DEFAULT_QUERY)
  const visible = useMemo(() => queryProducts(rows, query), [rows, query])
  const selected = rows.find((row) => row.product.id === selectedId)
  const detailsRef = useRef<HTMLDivElement>(null)

  // На телефоне карточка товара под списком — прокручиваем к ней при выборе.
  useEffect(() => {
    if (selectedId && window.matchMedia('(max-width: 1023px)').matches) {
      detailsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }, [selectedId])

  const exportCsv = () => downloadCsv(buildProductsCsv(queryProducts(rows, DEFAULT_QUERY)), csvFileName())

  const header = (
    <PageHeader
      title="Мои товары"
      description={rows.length > 0 ? `Сохранено товаров: ${rows.length}` : 'Сохранённые расчёты появятся здесь'}
      actions={
        <>
          <button type="button" className="btn btn--secondary" onClick={exportCsv} disabled={rows.length === 0}>
            <Icon name="download" size={18} />
            Экспорт CSV
          </button>
          <button type="button" className="btn btn--primary" onClick={onCreate}>
            <Icon name="plus" size={18} />
            Добавить товар
          </button>
        </>
      }
    />
  )

  if (rows.length === 0) {
    return (
      <>
        {header}
        <div className="card">
          <EmptyState
            icon="products"
            title="Пока нет сохранённых товаров"
            action={
              <button type="button" className="btn btn--primary" onClick={onCreate}>
                Рассчитать первый товар
              </button>
            }
          >
            Рассчитайте прибыль в калькуляторе и нажмите «Сохранить товар» — здесь можно будет сравнивать
            товары, искать, сортировать по прибыли и выгружать их в Excel.
          </EmptyState>
        </div>
      </>
    )
  }

  return (
    <>
      {header}
      <div className="products-layout">
        <section className="card products-layout__list" aria-label="Список товаров">
          <ProductsToolbar query={query} onChange={setQuery} />
          {visible.length > 0 ? (
            <ProductList rows={visible} selectedId={selectedId} onSelect={onSelect} />
          ) : (
            <EmptyState
              icon="search"
              title="Ничего не найдено"
              action={
                <button type="button" className="btn btn--secondary btn--sm" onClick={() => setQuery(DEFAULT_QUERY)}>
                  Сбросить фильтры
                </button>
              }
            >
              Попробуйте изменить запрос или выбрать другой маркетплейс.
            </EmptyState>
          )}
          <p className="products-layout__count">
            Показано {visible.length} из {rows.length}
          </p>
        </section>

        <div className="products-layout__details" ref={detailsRef}>
          {selected ? (
            <ProductDetails
              key={selected.product.id}
              row={selected}
              onEdit={() => onEdit(selected.product.id)}
              onDelete={() => onDelete(selected.product.id)}
            />
          ) : (
            <div className="card details-placeholder">
              <EmptyState icon="arrowRight" title="Выберите товар">
                {selectedId
                  ? 'Этот товар не найден — возможно, он был удалён.'
                  : 'Нажмите на товар в списке, чтобы увидеть подробный расчёт.'}
              </EmptyState>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
