import { Icon } from '../ui/Icon'

export function AppFooter({ onFeedback }: { onFeedback: () => void }) {
  return (
    <footer className="app-footer">
      <p>
        <span className="beta-badge">Бета</span> Расчёты носят оценочный характер и не заменяют отчёты
        маркетплейсов. Тарифы и расходы указываются пользователем.
      </p>
      <button type="button" className="link-btn app-footer__feedback" onClick={onFeedback}>
        <Icon name="chat" size={16} />
        Обратная связь
      </button>
    </footer>
  )
}
