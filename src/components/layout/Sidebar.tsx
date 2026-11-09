import type { PageId, Route } from '../../utils/route'
import { Navigation } from './Navigation'

interface SidebarProps {
  active: PageId
  productCount: number
  onNavigate: (route: Route) => void
}

export function Sidebar({ active, productCount, onNavigate }: SidebarProps) {
  return (
    <aside className="sidebar">
      <p className="sidebar__section">Меню</p>
      <Navigation variant="sidebar" active={active} productCount={productCount} onNavigate={onNavigate} />
      <div className="sidebar__note">
        <p className="sidebar__note-title">Как считаем</p>
        <p>
          Прибыль = цена продажи − все расходы на единицу. Ставки комиссий вы вводите сами — по
          данным личного кабинета маркетплейса.
        </p>
      </div>
    </aside>
  )
}
