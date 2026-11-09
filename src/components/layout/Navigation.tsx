import type { PageId, Route } from '../../utils/route'
import { routeToHash } from '../../utils/route'
import { Icon } from '../ui/Icon'
import { NAV_ITEMS } from './navItems'

interface NavigationProps {
  active: PageId
  productCount: number
  onNavigate: (route: Route) => void
  variant: 'sidebar' | 'bottom'
}

/** Одна навигация в двух видах: боковая панель на десктопе и нижняя панель на телефоне. */
export function Navigation({ active, productCount, onNavigate, variant }: NavigationProps) {
  return (
    <nav className={`nav nav--${variant}`} aria-label="Основная навигация">
      <ul className="nav__list">
        {NAV_ITEMS.map((item) => {
          const isActive = item.page === active
          return (
            <li key={item.page}>
              <a
                href={routeToHash({ page: item.page })}
                className={`nav__link${isActive ? ' is-active' : ''}`}
                aria-current={isActive ? 'page' : undefined}
                onClick={(e) => {
                  e.preventDefault()
                  onNavigate({ page: item.page })
                }}
              >
                <Icon name={item.icon} size={20} />
                <span className="nav__label">{item.label}</span>
                {item.page === 'products' && productCount > 0 && (
                  <span className="nav__count" aria-label={`${productCount} товаров`}>
                    {productCount}
                  </span>
                )}
              </a>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
