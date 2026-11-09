import {
  EASE_OPTIONS,
  FEEDBACK_CONTACT_MAX,
  FEEDBACK_TEXT_MAX,
  MARKETPLACE_OPTIONS,
  REGULAR_USE_OPTIONS,
  type FeedbackErrors,
  type FeedbackField,
  type FeedbackValues,
} from '../../utils/feedback'
import { Segmented } from '../ui/Segmented'

interface FeedbackFormProps {
  values: FeedbackValues
  errors: FeedbackErrors
  onChange: <K extends FeedbackField>(field: K, value: FeedbackValues[K]) => void
}

interface TextAreaProps {
  field: 'confusing' | 'missingFeature'
  label: string
  placeholder: string
  values: FeedbackValues
  errors: FeedbackErrors
  onChange: FeedbackFormProps['onChange']
}

function FeedbackTextArea({ field, label, placeholder, values, errors, onChange }: TextAreaProps) {
  const id = `feedback-${field}`
  const error = errors[field]
  return (
    <div className={`field${error || errors.text ? ' has-error' : ''}`}>
      <label className="field__label" htmlFor={id}>
        {label}
      </label>
      <textarea
        id={id}
        className="input textarea"
        rows={3}
        maxLength={FEEDBACK_TEXT_MAX + 1}
        placeholder={placeholder}
        value={values[field]}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${id}-error` : errors.text ? 'feedback-text-error' : undefined}
        onChange={(e) => onChange(field, e.target.value)}
      />
      {error && (
        <p className="field__error" id={`${id}-error`}>
          {error}
        </p>
      )}
    </div>
  )
}

export function FeedbackForm({ values, errors, onChange }: FeedbackFormProps) {
  return (
    <div className="feedback-form">
      <Segmented
        label="Какой маркетплейс вы используете?"
        size="sm"
        value={values.marketplace}
        options={MARKETPLACE_OPTIONS}
        onChange={(value) => onChange('marketplace', value)}
      />
      <Segmented
        label="Насколько легко было пользоваться калькулятором?"
        size="sm"
        value={values.ease}
        options={EASE_OPTIONS}
        onChange={(value) => onChange('ease', value)}
      />

      <fieldset className="field feedback-form__texts">
        <legend className="field__label">
          Ваш отзыв <span className="field__required" aria-hidden="true">*</span>
          <span className="feedback-form__legend-hint"> — заполните хотя бы одно поле</span>
        </legend>
        {errors.text && (
          <p className="field__error" id="feedback-text-error" role="alert">
            {errors.text}
          </p>
        )}
        <FeedbackTextArea
          field="confusing"
          label="Что было непонятно?"
          placeholder="Например: не сразу понял, от чего считается процент комиссии"
          values={values}
          errors={errors}
          onChange={onChange}
        />
        <FeedbackTextArea
          field="missingFeature"
          label="Какой функции не хватает?"
          placeholder="Например: расчёт для нескольких товаров сразу"
          values={values}
          errors={errors}
          onChange={onChange}
        />
      </fieldset>

      <Segmented
        label="Будете пользоваться MarginFlow регулярно?"
        size="sm"
        value={values.regularUse}
        options={REGULAR_USE_OPTIONS}
        onChange={(value) => onChange('regularUse', value)}
      />

      <div className={`field${errors.contact ? ' has-error' : ''}`}>
        <label className="field__label" htmlFor="feedback-contact">
          Контакт для связи <span className="field__optional">необязательно</span>
        </label>
        <input
          id="feedback-contact"
          className="input"
          type="text"
          autoComplete="off"
          maxLength={FEEDBACK_CONTACT_MAX + 1}
          placeholder="Telegram или e-mail"
          value={values.contact}
          aria-invalid={errors.contact ? true : undefined}
          aria-describedby={errors.contact ? 'feedback-contact-error' : 'feedback-contact-hint'}
          onChange={(e) => onChange('contact', e.target.value)}
        />
        {errors.contact ? (
          <p className="field__error" id="feedback-contact-error">
            {errors.contact}
          </p>
        ) : (
          <p className="field__hint" id="feedback-contact-hint">
            Если хотите, чтобы мы ответили или уточнили детали
          </p>
        )}
      </div>
    </div>
  )
}
