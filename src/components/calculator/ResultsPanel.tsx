import type { ProfitResult, ProfitStatus } from '../../types/profit'
import { formatPercent, formatRub, formatSignedRub, toneOf } from '../../utils/format'
import { ExpenseBreakdownList } from './ExpenseBreakdownList'

const STATUS_LABELS: Record<ProfitStatus, string> = {
  profit: 'Прибыльный',
  loss: 'Убыточный',
  breakeven: 'В ноль',
}

interface MetricProps {
  label: string
  value: string
  hint: string
  tone?: 'positive' | 'negative' | 'neutral'
}

function Metric({ label, value, hint, tone = 'neutral' }: MetricProps) {
  return (
    <div className="metric">
      <dt className="metric__label">{label}</dt>
      <dd className={`metric__value tone-${tone}`}>{value}</dd>
      <dd className="metric__hint">{hint}</dd>
    </div>
  )
}

function priceGap(result: ProfitResult): string | null {
  if (result.breakEvenPrice === null) return null
  const gap = result.sellingPrice - result.breakEvenPrice
  if (gap > 0) return `Запас до точки безубыточности: ${formatRub(gap)}`
  if (gap < 0) return `Чтобы выйти в ноль, поднимите цену на ${formatRub(-gap)}`
  return 'Цена совпадает с точкой безубыточности'
}

export function ResultsPanel({ result }: { result: ProfitResult }) {
  const tone = toneOf(result.netProfit)
  const gap = priceGap(result)

  return (
    <div className="results">
      <div className={`results__hero results__hero--${tone}`}>
        <div className="results__hero-head">
          <p className="results__hero-label">Чистая прибыль</p>
          <span className={`status-pill status-pill--${result.status}`}>{STATUS_LABELS[result.status]}</span>
        </div>
        <p className={`results__profit tone-${tone}`}>{formatSignedRub(result.netProfit)}</p>
        <p className="results__hero-sub">с одной продажи по цене {formatRub(result.sellingPrice)}</p>
      </div>

      <dl className="metrics">
        <Metric
          label="Рентабельность"
          value={formatPercent(result.marginPercent)}
          hint={result.marginPercent === null ? 'Нет цены продажи' : 'Прибыль / цена продажи'}
          tone={toneOf(result.marginPercent)}
        />
        <Metric
          label="Наценка"
          value={formatPercent(result.markupPercent)}
          hint={result.markupPercent === null ? 'Закупочная цена равна нулю' : 'К закупочной цене'}
          tone={toneOf(result.markupPercent)}
        />
        <Metric
          label="Точка безубыточности"
          value={result.breakEvenPrice === null ? 'Недостижима' : formatRub(result.breakEvenPrice)}
          hint={
            result.breakEvenPrice === null
              ? 'Комиссия забирает всю цену продажи'
              : 'Минимальная цена без убытка'
          }
        />
        <Metric label="Общие расходы" value={formatRub(result.totalExpenses)} hint="Включая закупку" />
      </dl>

      {gap && <p className={`results__gap tone-${toneOf(result.netProfit)}`}>{gap}</p>}

      <ExpenseBreakdownList result={result} />
    </div>
  )
}
