import { useState } from 'react'
import { describeCommission } from '../../utils/commission'
import { formatDate, formatRub } from '../../utils/format'
import type { ProductWithResult } from '../../utils/products'
import { ResultsPanel } from '../calculator/ResultsPanel'
import { Icon } from '../ui/Icon'
import { MarketplaceBadge } from '../ui/MarketplaceBadge'

interface ProductDetailsProps {
  row: ProductWithResult
  onEdit: () => void
  onDelete: () => void
}

export function ProductDetails({ row, onEdit, onDelete }: ProductDetailsProps) {
  const { product, result } = row
  const [confirming, setConfirming] = useState(false)

  return (
    <article className="card details" aria-labelledby="details-title">
      <header className="details__head">
        <div>
          <MarketplaceBadge marketplace={result.marketplace} />
          <h2 className="details__title" id="details-title">
            {result.productName}
          </h2>
          <p className="details__meta">
            Комиссия: {describeCommission(product.input.commission, formatRub)} · Изменён {formatDate(product.updatedAt)}
          </p>
        </div>
      </header>

      <div className="details__actions">
        {confirming ? (
          <div className="confirm" role="alertdialog" aria-label="Подтверждение удаления">
            <span className="confirm__text">Удалить товар без возможности восстановления?</span>
            <button type="button" className="btn btn--danger btn--sm" onClick={onDelete}>
              Удалить
            </button>
            <button type="button" className="btn btn--ghost btn--sm" onClick={() => setConfirming(false)} autoFocus>
              Отмена
            </button>
          </div>
        ) : (
          <>
            <button type="button" className="btn btn--secondary btn--sm" onClick={onEdit}>
              <Icon name="edit" size={16} />
              Изменить
            </button>
            <button type="button" className="btn btn--ghost-danger btn--sm" onClick={() => setConfirming(true)}>
              <Icon name="trash" size={16} />
              Удалить
            </button>
          </>
        )}
      </div>

      <ResultsPanel result={result} />
    </article>
  )
}
