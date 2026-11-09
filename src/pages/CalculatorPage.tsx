import { useState } from 'react'
import { CalculatorView } from '../components/calculator/CalculatorView'
import { EstimateNotice } from '../components/layout/EstimateNotice'
import { PageHeader } from '../components/layout/PageHeader'
import type { SavedProduct } from '../types/product'
import type { ProfitInput } from '../types/profit'
import { emptyFormValues, inputToForm, type ProductFormValues } from '../utils/productForm'

interface NewProductProps {
  draft: ProductFormValues
  onDraftChange: (values: ProductFormValues) => void
  onCreate: (input: ProfitInput) => void
  missingEditId?: string
}

/** Новый расчёт. Черновик хранится в App, чтобы не теряться при переходе между разделами. */
export function NewProductPage({ draft, onDraftChange, onCreate, missingEditId }: NewProductProps) {
  return (
    <>
      <PageHeader
        title="Калькулятор прибыли"
        description="Введите цену и расходы на единицу товара — результат пересчитывается сразу."
      />
      {missingEditId && (
        <div className="notice notice--warning" role="status">
          Товар для редактирования не найден — возможно, он был удалён. Открыт новый расчёт.
        </div>
      )}
      <EstimateNotice />
      <CalculatorView
        values={draft}
        onValuesChange={onDraftChange}
        isEditing={false}
        onSave={(input) => {
          onCreate(input)
          onDraftChange(emptyFormValues())
        }}
        onReset={() => onDraftChange(emptyFormValues())}
      />
    </>
  )
}

interface EditProductProps {
  product: SavedProduct
  onUpdate: (id: string, input: ProfitInput) => void
  onCancel: () => void
}

export function EditProductPage({ product, onUpdate, onCancel }: EditProductProps) {
  const [values, setValues] = useState(() => inputToForm(product.input))
  return (
    <>
      <PageHeader
        title="Редактирование товара"
        description={<>Изменения применятся к товару «{product.input.productName}» после сохранения.</>}
      />
      <EstimateNotice />
      <CalculatorView
        values={values}
        onValuesChange={setValues}
        isEditing
        onSave={(input) => onUpdate(product.id, input)}
        onCancel={onCancel}
        onReset={() => setValues(inputToForm(product.input))}
      />
    </>
  )
}
