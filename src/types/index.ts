/** Маркетплейсы, для которых рассчитывается прибыль. */
export type Marketplace = 'wildberries' | 'ozon'

export const MARKETPLACE_LABELS: Record<Marketplace, string> = {
  wildberries: 'Wildberries',
  ozon: 'Ozon',
}
