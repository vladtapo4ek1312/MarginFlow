interface NumberFieldProps {
  id: string
  label: string
  value: string
  onChange: (value: string) => void
  onBlur?: () => void
  error?: string
  hint?: string
  suffix?: '₽' | '%'
  required?: boolean
  placeholder?: string
}

/**
 * Текстовое поле для чисел: type="text" + inputMode="decimal", чтобы принимать
 * запятую и пробелы-разделители, а на телефоне открывать цифровую клавиатуру.
 */
export function NumberField({
  id,
  label,
  value,
  onChange,
  onBlur,
  error,
  hint,
  suffix = '₽',
  required = false,
  placeholder = '0',
}: NumberFieldProps) {
  const describedBy = error ? `${id}-error` : hint ? `${id}-hint` : undefined
  return (
    <div className={`field${error ? ' has-error' : ''}`}>
      <label className="field__label" htmlFor={id}>
        {label}
        {required && <span className="field__required" aria-hidden="true"> *</span>}
      </label>
      <div className="input-wrap">
        <input
          id={id}
          className="input input--number"
          type="text"
          inputMode="decimal"
          autoComplete="off"
          value={value}
          placeholder={placeholder}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          aria-required={required || undefined}
          onChange={(e) => onChange(e.target.value)}
          onBlur={onBlur}
        />
        <span className="input-wrap__suffix" aria-hidden="true">
          {suffix}
        </span>
      </div>
      {error ? (
        <p className="field__error" id={`${id}-error`}>
          {error}
        </p>
      ) : (
        hint && (
          <p className="field__hint" id={`${id}-hint`}>
            {hint}
          </p>
        )
      )}
    </div>
  )
}
