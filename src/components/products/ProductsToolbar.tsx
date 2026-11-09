import type { MarketplaceFilter, ProductQuery, ProductSort } from '../../utils/products'
import { Icon } from '../ui/Icon'
import { Segmented } from '../ui/Segmented'

const FILTER_OPTIONS = [
  { value: 'all', label: 'Все' },
  { value: 'wildberries', label: 'Wildberries' },
  { value: 'ozon', label: 'Ozon' },
] as const satisfies readonly { value: MarketplaceFilter; label: string }[]

const SORT_OPTIONS: { value: ProductSort; label: string }[] = [
  { value: 'profit-desc', label: 'Сначала самые прибыльные' },
  { value: 'profit-asc', label: 'Сначала убыточные' },
  { value: 'margin-desc', label: 'По рентабельности' },
  { value: 'updated-desc', label: 'Недавно изменённые' },
]

interface ProductsToolbarProps {
  query: ProductQuery
  onChange: (query: ProductQuery) => void
}

export function ProductsToolbar({ query, onChange }: ProductsToolbarProps) {
  return (
    <div className="toolbar">
      <label className="search">
        <span className="visually-hidden">Поиск по названию</span>
        <Icon name="search" size={18} />
        <input
          className="input search__input"
          type="search"
          placeholder="Поиск по названию"
          value={query.search}
          onChange={(e) => onChange({ ...query, search: e.target.value })}
        />
      </label>
      <Segmented
        label="Маркетплейс"
        hideLabel
        size="sm"
        value={query.marketplace}
        options={FILTER_OPTIONS}
        onChange={(marketplace) => onChange({ ...query, marketplace })}
      />
      <label className="select-wrap">
        <span className="visually-hidden">Сортировка</span>
        <select
          className="input select"
          value={query.sort}
          onChange={(e) => onChange({ ...query, sort: e.target.value as ProductSort })}
        >
          {SORT_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </label>
    </div>
  )
}
