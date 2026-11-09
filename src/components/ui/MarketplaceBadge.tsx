import { MARKETPLACE_LABELS, type Marketplace } from '../../types'

export function MarketplaceBadge({ marketplace }: { marketplace: Marketplace }) {
  return <span className={`mp-badge mp-badge--${marketplace}`}>{MARKETPLACE_LABELS[marketplace]}</span>
}
