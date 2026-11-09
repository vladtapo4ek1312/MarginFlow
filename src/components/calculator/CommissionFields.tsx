import { FIELD_LABELS } from '../../utils/productForm'
import { Segmented } from '../ui/Segmented'
import { NumberField } from './NumberField'
import type { FormHandlers } from './ProductForm'

const TYPE_OPTIONS = [
  { value: 'percent', label: 'Процент' },
  { value: 'fixed', label: 'Фиксированная сумма' },
] as const

const BASE_OPTIONS = [
  { value: 'sellingPrice', label: 'Цена продажи' },
  { value: 'purchaseCost', label: 'Закупочная цена' },
  { value: 'custom', label: 'Своя сумма' },
] as const

export function CommissionFields({ values, errors, onChange, onBlur }: FormHandlers) {
  const field = (name: 'commissionAmount' | 'commissionRate' | 'commissionBaseAmount') => ({
    id: `field-${name}`,
    label: FIELD_LABELS[name],
    value: values[name],
    error: errors[name],
    onChange: (value: string) => onChange(name, value),
    onBlur: () => onBlur(name),
    required: true,
  })

  return (
    <section className="card form-section" aria-labelledby="section-commission">
      <div className="form-section__head">
        <h2 className="form-section__title" id="section-commission">
          Комиссия маркетплейса
        </h2>
        <p className="form-section__note">Укажите ставку из личного кабинета — тарифы меняются</p>
      </div>

      <div className="form-grid">
        <div className="field--wide">
          <Segmented
            label="Тип комиссии"
            value={values.commissionType}
            options={TYPE_OPTIONS}
            onChange={(value) => onChange('commissionType', value)}
          />
        </div>

        {values.commissionType === 'fixed' ? (
          <NumberField {...field('commissionAmount')} hint="Сумма комиссии за одну продажу" />
        ) : (
          <>
            <NumberField {...field('commissionRate')} suffix="%" hint="От 0 до 100" />
            <div className="field--wide">
              <Segmented
                label="База расчёта комиссии"
                value={values.commissionBase}
                options={BASE_OPTIONS}
                onChange={(value) => onChange('commissionBase', value)}
                size="sm"
              />
            </div>
            {values.commissionBase === 'custom' && (
              <NumberField
                {...field('commissionBaseAmount')}
                hint="Например, цена до скидки маркетплейса"
              />
            )}
          </>
        )}
      </div>
    </section>
  )
}
