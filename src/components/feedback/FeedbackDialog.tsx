import { useEffect, useRef, useState } from 'react'
import { copyText } from '../../utils/clipboard'
import {
  buildFeedbackText,
  emptyFeedback,
  validateFeedback,
  type FeedbackField,
  type FeedbackValues,
} from '../../utils/feedback'
import { Icon } from '../ui/Icon'
import { FeedbackForm } from './FeedbackForm'

type Stage = 'editing' | 'copied' | 'copyFailed'

interface FeedbackDialogProps {
  open: boolean
  onClose: () => void
}

/**
 * Форма обратной связи без бэкенда: отзыв собирается в текст и копируется
 * в буфер обмена, а пользователь сам отправляет его организаторам беты.
 */
export function FeedbackDialog({ open, onClose }: FeedbackDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const previewRef = useRef<HTMLTextAreaElement>(null)
  const [values, setValues] = useState<FeedbackValues>(emptyFeedback)
  const [submitted, setSubmitted] = useState(false)
  const [stage, setStage] = useState<Stage>('editing')
  const [copiedText, setCopiedText] = useState('')

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return
    if (open && !dialog.open) dialog.showModal()
    if (!open && dialog.open) dialog.close()
  }, [open])

  useEffect(() => {
    if (stage === 'copyFailed') previewRef.current?.select()
  }, [stage])

  const allErrors = validateFeedback(values)
  // Требование заполнить текст показываем после попытки отправки; подозрение на секреты — сразу.
  const errors = submitted ? allErrors : { ...allErrors, text: undefined }

  const handleChange = <K extends FeedbackField>(field: K, value: FeedbackValues[K]) =>
    setValues((prev) => ({ ...prev, [field]: value }))

  const handleCopy = async () => {
    setSubmitted(true)
    if (Object.keys(allErrors).length > 0) return
    const text = buildFeedbackText(values)
    setCopiedText(text)
    setStage((await copyText(text)) ? 'copied' : 'copyFailed')
  }

  const handleClose = () => {
    // После успешного копирования начинаем с чистого листа; черновик без копирования сохраняем.
    if (stage === 'copied') {
      setValues(emptyFeedback())
      setSubmitted(false)
    }
    setStage('editing')
    onClose()
  }

  return (
    <dialog
      ref={dialogRef}
      className="dialog"
      aria-labelledby="feedback-title"
      onCancel={(e) => {
        e.preventDefault()
        handleClose()
      }}
      onMouseDown={(e) => {
        if (e.target === dialogRef.current) handleClose()
      }}
    >
      <div className="dialog__panel">
        <header className="dialog__head">
          <div>
            <h2 className="dialog__title" id="feedback-title">
              Обратная связь
            </h2>
            <p className="dialog__subtitle">Помогите сделать MarginFlow удобнее. Займёт пару минут.</p>
          </div>
          <button type="button" className="dialog__close" onClick={handleClose} aria-label="Закрыть">
            <Icon name="close" size={18} />
          </button>
        </header>

        {stage === 'editing' ? (
          <>
            <div className="dialog__body">
              <div className="notice notice--info feedback-privacy">
                <Icon name="lock" size={16} />
                <p>
                  Не указывайте пароли, ключи API, данные входа в кабинеты маркетплейсов, номера карт и счетов.
                  Отзыв никуда не отправляется автоматически — вы скопируете его и отправите сами.
                </p>
              </div>
              <FeedbackForm values={values} errors={errors} onChange={handleChange} />
            </div>
            <footer className="dialog__actions">
              <button type="button" className="btn btn--ghost" onClick={handleClose}>
                Отмена
              </button>
              <button type="button" className="btn btn--primary" onClick={handleCopy}>
                <Icon name="copy" size={18} />
                Скопировать отзыв
              </button>
            </footer>
          </>
        ) : (
          <>
            <div className="dialog__body">
              {stage === 'copied' ? (
                <div className="feedback-result feedback-result--success" role="status">
                  <span className="feedback-result__icon">
                    <Icon name="check" size={22} />
                  </span>
                  <div>
                    <p className="feedback-result__title">Отзыв скопирован в буфер обмена</p>
                    <p>Вставьте его в чат или письмо, через которое вы получили приглашение в бету. Спасибо!</p>
                  </div>
                </div>
              ) : (
                <div className="notice notice--warning" role="alert">
                  <Icon name="alert" size={18} />
                  <p>
                    Браузер не разрешил скопировать текст автоматически. Он уже выделен ниже — нажмите Ctrl+C
                    (на телефоне — «Копировать»).
                  </p>
                </div>
              )}
              <label className="field__label feedback-preview__label" htmlFor="feedback-preview">
                Текст отзыва
              </label>
              <textarea
                id="feedback-preview"
                ref={previewRef}
                className="input textarea feedback-preview"
                readOnly
                rows={10}
                value={copiedText}
                onFocus={(e) => e.currentTarget.select()}
              />
            </div>
            <footer className="dialog__actions">
              <button type="button" className="btn btn--ghost" onClick={() => setStage('editing')}>
                Изменить отзыв
              </button>
              <button type="button" className="btn btn--primary" onClick={handleClose}>
                Готово
              </button>
            </footer>
          </>
        )}
      </div>
    </dialog>
  )
}
