import { useEffect } from 'react'
import { Icon } from './Icon'

export interface ToastMessage {
  id: number
  text: string
  tone: 'success' | 'error'
}

const TOAST_DURATION_MS = 3500

export function Toast({ toast, onClose }: { toast: ToastMessage | null; onClose: () => void }) {
  useEffect(() => {
    if (!toast) return
    const timer = window.setTimeout(onClose, TOAST_DURATION_MS)
    return () => window.clearTimeout(timer)
  }, [toast, onClose])

  return (
    <div className="toast-region" aria-live="polite">
      {toast && (
        <div className={`toast toast--${toast.tone}`} key={toast.id}>
          <Icon name={toast.tone === 'success' ? 'check' : 'alert'} size={18} />
          <span>{toast.text}</span>
          <button type="button" className="toast__close" onClick={onClose} aria-label="Закрыть уведомление">
            <Icon name="close" size={16} />
          </button>
        </div>
      )}
    </div>
  )
}
