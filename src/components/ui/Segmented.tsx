import { useId } from 'react'

export interface SegmentedOption<T extends string> {
  value: T
  label: string
}

interface SegmentedProps<T extends string> {
  label: string
  /** Пустая строка — ничего не выбрано (для необязательных вопросов). */
  value: T | ''
  options: readonly SegmentedOption<T>[]
  onChange: (value: T) => void
  /** Скрыть подпись визуально (остаётся для экранных читалок). */
  hideLabel?: boolean
  size?: 'md' | 'sm'
}

/** Переключатель из нескольких вариантов на основе радиокнопок — доступен с клавиатуры. */
export function Segmented<T extends string>({
  label,
  value,
  options,
  onChange,
  hideLabel = false,
  size = 'md',
}: SegmentedProps<T>) {
  const name = useId()
  return (
    <fieldset className="field segmented-field">
      <legend className={hideLabel ? 'visually-hidden' : 'field__label'}>{label}</legend>
      <div className={`segmented segmented--${size}`}>
        {options.map((option) => (
          <label
            key={option.value}
            className={`segmented__option${option.value === value ? ' is-active' : ''}`}
          >
            <input
              type="radio"
              name={name}
              value={option.value}
              checked={option.value === value}
              onChange={() => onChange(option.value)}
            />
            <span>{option.label}</span>
          </label>
        ))}
      </div>
    </fieldset>
  )
}
