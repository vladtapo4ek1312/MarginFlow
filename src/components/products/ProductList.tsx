import { formatPercent, formatRub, formatSignedRub, toneOf } from '../../utils/format'
import type { ProductWithResult } from '../../utils/products'
import { MarketplaceBadge } from '../ui/MarketplaceBadge'

interface ProductListProps {
  rows: ProductWithResult[]
  selectedId?: string
  onSelect: (id: string) => void
}

export function ProductList({ rows, selectedId, onSelect }: ProductListProps) {
  return (
    <div className="product-list" role="list">
      <div className="product-list__head" aria-hidden="true">
        <span>Товар</span>
        <span>Цена</span>
        <span>Прибыль</span>
        <span>Рентаб.</span>
      </div>
      {rows.map(({ product, result }) => {
        const isSelected = product.id === selectedId
        return (
          <div role="listitem" key={product.id}>
            <button
              type="button"
              className={`product-row${isSelected ? ' is-selected' : ''}`}
              aria-pressed={isSelected}
              onClick={() => onSelect(product.id)}
            >
              <span className="product-row__main">
                <span className="product-row__name">{result.productName}</span>
                <MarketplaceBadge marketplace={result.marketplace} />
              </span>
              <span className="product-row__cell product-row__price" data-label="Цена">
                {formatRub(result.sellingPrice)}
              </span>
              <span className={`product-row__cell product-row__profit tone-${toneOf(result.netProfit)}`} data-label="Прибыль">
                {formatSignedRub(result.netProfit)}
              </span>
              <span className={`product-row__cell tone-${toneOf(result.marginPercent)}`} data-label="Рентаб.">
                {formatPercent(result.marginPercent)}
              </span>
            </button>
          </div>
        )
      })}
    </div>
  )
}
