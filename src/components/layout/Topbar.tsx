import { Icon } from '../ui/Icon'
import { Logo } from './Logo'

interface TopbarProps {
  onHome: () => void
  onNewCalculation: () => void
  onFeedback: () => void
}

export function Topbar({ onHome, onNewCalculation, onFeedback }: TopbarProps) {
  return (
    <header className="topbar">
      <a
        className="topbar__brand"
        href="#/overview"
        onClick={(e) => {
          e.preventDefault()
          onHome()
        }}
        aria-label="MarginFlow — обзор"
      >
        <Logo />
      </a>
      <span className="beta-badge" title="Закрытое бета-тестирование">
        Бета
      </span>
      <span className="topbar__tag">Юнит-экономика для Wildberries и Ozon</span>
      <div className="topbar__actions">
        <span className="topbar__privacy" title="Данные не покидают ваш браузер">
          <Icon name="lock" size={14} />
          Данные хранятся только в браузере
        </span>
        <button
          type="button"
          className="btn btn--secondary btn--sm topbar__feedback"
          onClick={onFeedback}
          aria-label="Обратная связь"
        >
          <Icon name="chat" size={16} />
          <span>Обратная связь</span>
        </button>
        <button type="button" className="btn btn--primary btn--sm" onClick={onNewCalculation}>
          <Icon name="plus" size={16} />
          <span>Новый расчёт</span>
        </button>
      </div>
    </header>
  )
}
