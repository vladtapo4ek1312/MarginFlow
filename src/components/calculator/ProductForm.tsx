import type { Marketplace } from '../../types'
import { MARKETPLACE_LABELS } from '../../types'
import {
  EXPENSE_FIELDS,
  FIELD_LABELS,
  type FormErrors,
  type ProductFormField,
  type ProductFormValues,
} from '../../utils/productForm'
import { Segmented } from '../ui/Segmented'
import { CommissionFields } from './CommissionFields'
import { NumberField } from './NumberField'

export interface FormHandlers {
  values: ProductFormValues
  errors: FormErrors
  onChange: <K extends ProductFormField>(field: K, value: ProductFormValues[K]) => void
  onBlur: (field: ProductFormField) => void
}

const MARKETPLACE_OPTIONS = (Object.keys(MARKETPLACE_LABELS) as Marketplace[]).map((value) => ({
  value,
  label: MARKETPLACE_LABELS[value],
}))

const EXPENSE_HINTS: Partial<Record<ProductFormField, string>> = {
  logistics: 'Доставка до покупателя и обратная',
  storage: 'Хранение на складе в расчёте на единицу',
  advertising: 'Рекламные расходы на одну продажу',
  tax: 'Сумма налога с одной продажи',
}

export function ProductForm(props: FormHandlers) {
  const { values, errors, onChange, onBlur } = props
  const numberProps = (field: ProductFormField) => ({
    id: `field-${field}`,
    label: FIELD_LABELS[field],
    value: values[field],
    error: errors[field],
    onChange: (value: string) => onChange(field, value),
    onBlur: () => onBlur(field),
  })

  return (
    <form className="calc-form" noValidate onSubmit={(e) => e.preventDefault()}>
      <section className="card form-section" aria-labelledby="section-product">
        <h2 className="form-section__title" id="section-product">
          Товар
        </h2>
        <div className="form-grid">
          <div className={`field field--wide${errors.productName ? ' has-error' : ''}`}>
            <label className="field__label" htmlFor="field-productName">
              Название товара
            </label>
            <input
              id="field-productName"
              className="input"
              type="text"
              maxLength={120}
              value={values.productName}
              placeholder="Например, футболка оверсайз белая"
              aria-invalid={errors.productName ? true : undefined}
              aria-describedby={errors.productName ? 'field-productName-error' : 'field-productName-hint'}
              onChange={(e) => onChange('productName', e.target.value)}
              onBlur={() => onBlur('productName')}
            />
            {errors.productName ? (
              <p className="field__error" id="field-productName-error">
                {errors.productName}
              </p>
            ) : (
              <p className="field__hint" id="field-productName-hint">
                Нужно для сохранения — для расчёта необязательно
              </p>
            )}
          </div>
          <div className="field--wide">
            <Segmented
              label="Маркетплейс"
              value={values.marketplace}
              options={MARKETPLACE_OPTIONS}
              onChange={(value) => onChange('marketplace', value)}
            />
          </div>
        </div>
      </section>

      <section className="card form-section" aria-labelledby="section-price">
        <h2 className="form-section__title" id="section-price">
          Цена и закупка
        </h2>
        <div className="form-grid">
          <NumberField {...numberProps('sellingPrice')} required hint="Цена, которую платит покупатель" />
          <NumberField {...numberProps('purchaseCost')} required hint="Себестоимость единицы товара" />
        </div>
      </section>

      <CommissionFields {...props} />

      <section className="card form-section" aria-labelledby="section-expenses">
        <div className="form-section__head">
          <h2 className="form-section__title" id="section-expenses">
            Расходы на единицу
          </h2>
          <p className="form-section__note">Пустое поле считается нулём</p>
        </div>
        <div className="form-grid form-grid--3">
          {EXPENSE_FIELDS.map((field) => (
            <NumberField key={field} {...numberProps(field)} hint={EXPENSE_HINTS[field]} />
          ))}
        </div>
      </section>
    </form>
  )
}
