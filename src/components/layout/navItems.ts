import type { PageId } from '../../utils/route'
import type { IconName } from '../ui/Icon'

export interface NavItem {
  page: PageId
  label: string
  icon: IconName
}

export const NAV_ITEMS: readonly NavItem[] = [
  { page: 'overview', label: 'Обзор', icon: 'overview' },
  { page: 'calculator', label: 'Калькулятор', icon: 'calculator' },
  { page: 'products', label: 'Мои товары', icon: 'products' },
]
