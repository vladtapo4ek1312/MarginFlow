import { useMemo } from 'react'
import { computePortfolioStats, summarizeByMarketplace } from '../calculations/portfolio'
import { PageHeader } from '../components/layout/PageHeader'
import { EmptyState } from '../components/ui/EmptyState'
import { Icon } from '../components/ui/Icon'
import { MarketplaceBadge } from '../components/ui/MarketplaceBadge'
import { StatCard } from '../components/ui/StatCard'
import { formatPercent, formatRub, formatSignedRub, pluralize, toneOf } from '../utils/format'
import { queryProducts, type ProductWithResult } from '../utils/products'

interface OverviewPageProps {
  rows: ProductWithResult[]
  onOpenProduct: (id: string) => void
  onCreate: () => void
  onOpenProducts: () => void
}

const TOP_LIMIT = 5
const PRODUCT_FORMS = { one: 'товар', few: 'товара', many: 'товаров' }

function ProductLinks({ rows, onOpen }: { rows: ProductWithResult[]; onOpen: (id: string) => void }) {
  return (
    <ul className="mini-list">
      {rows.map(({ product, result }) => (
        <li key={product.id}>
          <button type="button" className="mini-list__item" onClick={() => onOpen(product.id)}>
            <span className="mini-list__name">
              {result.productName}
              <MarketplaceBadge marketplace={result.marketplace} />
            </span>
            <span className="mini-list__values">
              <span className={`mini-list__profit tone-${toneOf(result.netProfit)}`}>
                {formatSignedRub(result.netProfit)}
              </span>
              <span className="mini-list__margin">{formatPercent(result.marginPercent)}</span>
            </span>
          </button>
        </li>
      ))}
    </ul>
  )
}

export function OverviewPage({ rows, onOpenProduct, onCreate, onOpenProducts }: OverviewPageProps) {
  const results = useMemo(() => rows.map((r) => r.result), [rows])
  const stats = useMemo(() => computePortfolioStats(results), [results])
  const byMarketplace = useMemo(() => summarizeByMarketplace(results), [results])
  const sorted = useMemo(
    () => queryProducts(rows, { search: '', marketplace: 'all', sort: 'profit-desc' }),
    [rows],
  )

  if (rows.length === 0) {
    return (
      <>
        <PageHeader title="Обзор" description="Сводка по всем сохранённым товарам" />
        <div className="card">
          <EmptyState
            icon="overview"
            title="Здесь появится сводка по вашим товарам"
            action={
              <button type="button" className="btn btn--primary" onClick={onCreate}>
                <Icon name="plus" size={18} />
                Рассчитать первый товар
              </button>
            }
          >
            <p>Сохраните хотя бы один расчёт, и MarginFlow покажет:</p>
            <ul className="empty-state__bullets">
              <li>суммарную прибыль и среднюю рентабельность;</li>
              <li>самые прибыльные и убыточные товары;</li>
              <li>сравнение Wildberries и Ozon.</li>
            </ul>
          </EmptyState>
        </div>
      </>
    )
  }

  const losses = sorted.filter((r) => r.result.status === 'loss').reverse()
  const top = sorted.filter((r) => r.result.netProfit > 0).slice(0, TOP_LIMIT)
  const marginCount = results.filter((r) => r.marginPercent !== null).length

  return (
    <>
      <PageHeader title="Обзор" description="Сводка по всем сохранённым товарам. Прибыль — с одной продажи." />

      <div className="stats-grid">
        <StatCard label="Количество товаров" value={String(stats.count)} hint="Сохранено в браузере" />
        <StatCard
          label="Суммарная расчётная прибыль"
          value={formatSignedRub(stats.totalProfit)}
          tone={toneOf(stats.totalProfit)}
          hint="По одной продаже каждого товара"
        />
        <StatCard
          label="Средняя рентабельность"
          value={formatPercent(stats.averageMargin)}
          tone={toneOf(stats.averageMargin)}
          hint={
            stats.averageMargin === null
              ? 'Нет товаров с ценой продажи'
              : marginCount < stats.count
                ? `По ${marginCount} из ${stats.count} товаров с ценой`
                : 'Среднее по всем товарам'
          }
        />
        <StatCard
          label="Убыточные товары"
          value={String(stats.lossCount)}
          tone={stats.lossCount > 0 ? 'negative' : 'neutral'}
          hint={stats.lossCount > 0 ? 'Проверьте цены и расходы' : 'Все товары окупаются'}
        />
      </div>

      <div className="overview-grid">
        <section className="card panel">
          <div className="panel__head">
            <h2 className="panel__title">Самые прибыльные</h2>
            <button type="button" className="link-btn" onClick={onOpenProducts}>
              Все товары
            </button>
          </div>
          {top.length > 0 ? (
            <ProductLinks rows={top} onOpen={onOpenProduct} />
          ) : (
            <p className="panel__empty">Пока нет товаров с положительной прибылью.</p>
          )}
        </section>

        <section className="card panel">
          <div className="panel__head">
            <h2 className="panel__title">Требуют внимания</h2>
            {losses.length > 0 && <span className="count-pill count-pill--negative">{losses.length}</span>}
          </div>
          {losses.length > 0 ? (
            <ProductLinks rows={losses} onOpen={onOpenProduct} />
          ) : (
            <p className="panel__empty panel__empty--positive">
              <Icon name="check" size={18} /> Убыточных товаров нет.
            </p>
          )}
        </section>

        <section className="card panel panel--wide">
          <div className="panel__head">
            <h2 className="panel__title">По маркетплейсам</h2>
          </div>
          <div className="mp-summary">
            {byMarketplace.map((m) => (
              <div className="mp-summary__item" key={m.marketplace}>
                <MarketplaceBadge marketplace={m.marketplace} />
                <p className="mp-summary__count">
                  {m.count} {pluralize(m.count, PRODUCT_FORMS)}
                </p>
                <p className={`mp-summary__profit tone-${toneOf(m.totalProfit)}`}>
                  {m.count > 0 ? formatSignedRub(m.totalProfit) : formatRub(0)}
                </p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </>
  )
}

