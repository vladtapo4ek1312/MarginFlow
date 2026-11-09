import type { ReactNode } from 'react'
import { Icon, type IconName } from './Icon'

interface EmptyStateProps {
  icon: IconName
  title: string
  children: ReactNode
  action?: ReactNode
}

export function EmptyState({ icon, title, children, action }: EmptyStateProps) {
  return (
    <div className="empty-state">
      <span className="empty-state__icon">
        <Icon name={icon} size={24} />
      </span>
      <h3 className="empty-state__title">{title}</h3>
      <div className="empty-state__text">{children}</div>
      {action && <div className="empty-state__action">{action}</div>}
    </div>
  )
}
