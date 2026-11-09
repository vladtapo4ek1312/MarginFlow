import type { Marketplace } from '../types'
import type { ProfitResult } from '../types/profit'
import { roundTo, roundToKopecks } from './money'

export interface PortfolioStats {
  count: number
  /** Сумма прибыли с одной продажи каждого товара. */
  totalProfit: number
  /** Среднее арифметическое рентабельности; null, если она не определена ни у одного товара. */
  averageMargin: number | null
  lossCount: number
}

export function computePortfolioStats(results: ProfitResult[]): PortfolioStats {
  const margins = results
    .map((r) => r.marginPercent)
    .filter((m): m is number => m !== null)

  return {
    count: results.length,
    totalProfit: roundToKopecks(results.reduce((sum, r) => sum + r.netProfit, 0)),
    averageMargin:
      margins.length === 0 ? null : roundTo(margins.reduce((sum, m) => sum + m, 0) / margins.length, 2),
    lossCount: results.filter((r) => r.status === 'loss').length,
  }
}

export interface MarketplaceSummary {
  marketplace: Marketplace
  count: number
  totalProfit: number
}

export function summarizeByMarketplace(results: ProfitResult[]): MarketplaceSummary[] {
  const order: Marketplace[] = ['wildberries', 'ozon']
  return order.map((marketplace) => {
    const own = results.filter((r) => r.marketplace === marketplace)
    return {
      marketplace,
      count: own.length,
      totalProfit: roundToKopecks(own.reduce((sum, r) => sum + r.netProfit, 0)),
    }
  })
}
