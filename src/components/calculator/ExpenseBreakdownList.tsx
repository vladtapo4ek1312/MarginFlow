import type { ExpenseBreakdown, ProfitResult } from '../../types/profit'
import { formatRub } from '../../utils/format'

const LABELS: Record<keyof ExpenseBreakdown, string> = {
  purchaseCost: 'Закупка',
  commission: 'Комиссия',
  logistics: 'Логистика',
  storage: 'Хранение',
  packaging: 'Упаковка',
  advertising: 'Реклама',
  tax: 'Налог',
  otherExpenses: 'Прочее',
}

/** Структура расходов: доля каждой статьи от цены продажи (или от расходов, если они больше цены). */
export function ExpenseBreakdownList({ result }: { result: ProfitResult }) {
  const scale = Math.max(result.sellingPrice, result.totalExpenses)
  const items = (Object.keys(LABELS) as (keyof ExpenseBreakdown)[])
    .map((key) => ({ key, label: LABELS[key], amount: result.expenses[key] }))
    .filter((item) => item.amount > 0)

  if (items.length === 0) return null

  return (
    <div className="breakdown">
      <h3 className="breakdown__title">Структура расходов</h3>
      <ul className="breakdown__list">
        {items.map((item) => {
          const share = scale > 0 ? (item.amount / scale) * 100 : 0
          return (
            <li key={item.key} className="breakdown__item">
              <div className="breakdown__row">
                <span>{item.label}</span>
                <span className="breakdown__amount">{formatRub(item.amount)}</span>
              </div>
              <div className="breakdown__track" aria-hidden="true">
                <span className="breakdown__bar" style={{ width: `${Math.min(share, 100)}%` }} />
              </div>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
