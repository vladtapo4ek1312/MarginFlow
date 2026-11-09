import type { StorageStatus } from '../../hooks/useProducts'
import { Icon } from '../ui/Icon'

/** Предупреждает о проблемах с localStorage вместо того, чтобы молча терять данные. */
export function StorageNotice({ status }: { status: StorageStatus }) {
  let text: string | null = null
  if (status.unavailable) {
    text = 'Браузер запрещает сохранять данные (например, в приватном режиме). Расчёты работают, но товары не сохранятся.'
  } else if (status.saveFailed) {
    text = 'Не удалось сохранить изменения в браузере — возможно, хранилище переполнено.'
  } else if (status.corrupted) {
    text = 'Сохранённые данные повреждены и не могут быть прочитаны. При следующем сохранении их копия будет отложена отдельно.'
  } else if (status.skipped > 0) {
    text = `Пропущено повреждённых записей: ${status.skipped}. Остальные товары загружены.`
  }

  if (!text) return null
  return (
    <div className="notice notice--warning" role="status">
      <Icon name="alert" size={18} />
      <span>{text}</span>
    </div>
  )
}
