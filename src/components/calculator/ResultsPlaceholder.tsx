import { FIELD_LABELS, type FormErrors, type ProductFormField } from '../../utils/productForm'
import { Icon } from '../ui/Icon'

/** Показывается вместо результатов, пока данные неполные или некорректные — без NaN и нулей-заглушек. */
export function ResultsPlaceholder({ errors }: { errors: FormErrors }) {
  const fields = Object.keys(errors) as ProductFormField[]
  const onlyEmpty = fields.every((f) => errors[f] === 'Заполните поле')

  return (
    <div className="results-placeholder">
      <span className="results-placeholder__icon">
        <Icon name="calculator" size={22} />
      </span>
      <p className="results-placeholder__title">
        {onlyEmpty ? 'Заполните данные для расчёта' : 'Исправьте ошибки, чтобы увидеть расчёт'}
      </p>
      <ul className="results-placeholder__list">
        {fields.map((field) => (
          <li key={field}>
            <a
              href={`#field-${field}`}
              onClick={(e) => {
                e.preventDefault()
                document.getElementById(`field-${field}`)?.focus()
              }}
            >
              {FIELD_LABELS[field]}
            </a>
            {!onlyEmpty && <span> — {errors[field]?.toLowerCase()}</span>}
          </li>
        ))}
      </ul>
    </div>
  )
}
