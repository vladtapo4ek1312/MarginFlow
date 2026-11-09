import { useMemo, useState } from 'react'
import { calculateProfit } from '../../calculations/profit'
import type { ProfitInput } from '../../types/profit'
import { formatPercent, formatSignedRub, toneOf } from '../../utils/format'
import {
  formToInput,
  mapErrorsToForm,
  validateForSave,
  type FormErrors,
  type ProductFormField,
  type ProductFormValues,
} from '../../utils/productForm'
import { Icon } from '../ui/Icon'
import { ProductForm } from './ProductForm'
import { ResultsPanel } from './ResultsPanel'
import { ResultsPlaceholder } from './ResultsPlaceholder'

interface CalculatorViewProps {
  values: ProductFormValues
  onValuesChange: (values: ProductFormValues) => void
  isEditing: boolean
  onSave: (input: ProfitInput) => void
  onCancel?: () => void
  onReset: () => void
}

export function CalculatorView({ values, onValuesChange, isEditing, onSave, onCancel, onReset }: CalculatorViewProps) {
  const [touched, setTouched] = useState<ReadonlySet<ProductFormField>>(new Set())
  const [submitted, setSubmitted] = useState(false)

  const input = useMemo(() => formToInput(values), [values])
  const calculation = useMemo(() => calculateProfit(input), [input])
  const engineErrors = useMemo(
    () => (calculation.ok ? {} : mapErrorsToForm(calculation.errors, values)),
    [calculation, values],
  )

  // Пустые поля не ругаем, пока пользователь до них не дошёл; некорректный ввод — сразу.
  const visibleErrors: FormErrors = {}
  for (const [field, message] of Object.entries(engineErrors) as [ProductFormField, string][]) {
    if (submitted || touched.has(field) || values[field].trim() !== '') visibleErrors[field] = message
  }
  if (submitted) Object.assign(visibleErrors, validateForSave(values))

  const handleChange = <K extends ProductFormField>(field: K, value: ProductFormValues[K]) =>
    onValuesChange({ ...values, [field]: value })
  const handleBlur = (field: ProductFormField) =>
    setTouched((prev) => (prev.has(field) ? prev : new Set(prev).add(field)))

  const handleSave = () => {
    setSubmitted(true)
    const saveErrors = validateForSave(values)
    const firstInvalid = Object.keys({ ...saveErrors, ...engineErrors })[0]
    if (firstInvalid || !calculation.ok) {
      document.getElementById(`field-${firstInvalid}`)?.focus()
      return
    }
    onSave(input)
    setSubmitted(false)
    setTouched(new Set())
  }

  const handleReset = () => {
    setSubmitted(false)
    setTouched(new Set())
    onReset()
  }

  return (
    <div className="calculator">
      <div className="calculator__form">
        <ProductForm values={values} errors={visibleErrors} onChange={handleChange} onBlur={handleBlur} />
      </div>

      <aside className="calculator__results" aria-label="Результаты расчёта" id="results">
        <div className="card results-card">
          <div className="results-card__head">
            <h2 className="results-card__title">Результат</h2>
            <span className="results-card__live">
              <span className="live-dot" aria-hidden="true" />
              Обновляется автоматически
            </span>
          </div>
          <div className="results-card__body" aria-live="polite">
            {calculation.ok ? <ResultsPanel result={calculation.result} /> : <ResultsPlaceholder errors={engineErrors} />}
          </div>
          <div className="results-card__actions">
            <button type="button" className="btn btn--primary btn--block" onClick={handleSave}>
              <Icon name="check" size={18} />
              {isEditing ? 'Сохранить изменения' : 'Сохранить товар'}
            </button>
            {isEditing ? (
              <button type="button" className="btn btn--ghost btn--block" onClick={onCancel}>
                Отменить
              </button>
            ) : (
              <button type="button" className="btn btn--ghost btn--block" onClick={handleReset}>
                Очистить форму
              </button>
            )}
          </div>
        </div>
      </aside>

      {calculation.ok && (
        <a className="result-dock" href="#results" onClick={(e) => {
          e.preventDefault()
          document.getElementById('results')?.scrollIntoView({ behavior: 'smooth' })
        }}>
          <span className="result-dock__label">Прибыль</span>
          <span className={`result-dock__value tone-${toneOf(calculation.result.netProfit)}`}>
            {formatSignedRub(calculation.result.netProfit)}
          </span>
          <span className="result-dock__meta">{formatPercent(calculation.result.marginPercent)}</span>
        </a>
      )}
    </div>
  )
}
