import { describe, expect, it } from 'vitest'
import { calculateProfit } from '../src/calculations/profit'
import {
  emptyFormValues,
  formToInput,
  inputToForm,
  mapErrorsToForm,
  parseDecimal,
  validateForSave,
  type ProductFormValues,
} from '../src/utils/productForm'
import { sampleInput } from './fixtures'

describe('parseDecimal', () => {
  it.each([
    ['1500', 1500],
    ['1 500,50', 1500.5],
    ['1 500.5', 1500.5],
    ['0,5', 0.5],
    [',5', 0.5],
    ['12,', 12],
    ['-10', -10],
    ['−10', -10],
  ])('«%s» → %s', (raw, expected) => {
    expect(parseDecimal(raw)).toBe(expected)
  })

  it('пустая строка — null', () => {
    expect(parseDecimal('')).toBeNull()
    expect(parseDecimal('   ')).toBeNull()
  })

  it.each(['abc', '1,2,3', '1.2.3', '12р', '-', '1e5'])('мусор «%s» → NaN', (raw) => {
    expect(parseDecimal(raw)).toBeNaN()
  })
})

function filled(overrides: Partial<ProductFormValues> = {}): ProductFormValues {
  return { ...inputToForm(sampleInput), ...overrides }
}

describe('formToInput', () => {
  it('пустые необязательные расходы считаются нулём', () => {
    const input = formToInput({ ...emptyFormValues(), sellingPrice: '1000', purchaseCost: '400', commissionRate: '10' })
    expect(input.logistics).toBe(0)
    expect(input.otherExpenses).toBe(0)
    expect(calculateProfit(input).ok).toBe(true)
  })

  it('пустые обязательные поля не превращаются в ноль', () => {
    const calculation = calculateProfit(formToInput(emptyFormValues()))
    expect(calculation.ok).toBe(false)
  })

  it('собирает фиксированную комиссию', () => {
    const input = formToInput(filled({ commissionType: 'fixed', commissionAmount: '250' }))
    expect(input.commission).toEqual({ type: 'fixed', amount: 250 })
  })

  it('собирает процент от пользовательской суммы', () => {
    const input = formToInput(filled({ commissionRate: '15', commissionBase: 'custom', commissionBaseAmount: '2 000' }))
    expect(input.commission).toEqual({ type: 'percent', rate: 15, base: { kind: 'custom', amount: 2000 } })
  })

  it('inputToForm → formToInput возвращает исходные данные', () => {
    const custom = { ...sampleInput, commission: { type: 'percent', rate: 17.5, base: { kind: 'custom', amount: 999.99 } } } as const
    expect(formToInput(inputToForm(custom))).toEqual(custom)
    const fixed = { ...sampleInput, commission: { type: 'fixed', amount: 120.5 } } as const
    expect(formToInput(inputToForm(fixed))).toEqual(fixed)
  })
})

describe('mapErrorsToForm', () => {
  it('переносит ошибки движка на поля формы', () => {
    const values = filled({ sellingPrice: '-5', commissionRate: '150', logistics: 'abc' })
    const calculation = calculateProfit(formToInput(values))
    expect(calculation.ok).toBe(false)
    if (calculation.ok) return
    expect(mapErrorsToForm(calculation.errors, values)).toEqual({
      sellingPrice: 'Значение не может быть отрицательным',
      commissionRate: 'Процент должен быть от 0 до 100',
      logistics: 'Введите число',
    })
  })

  it('для пустых обязательных полей пишет «Заполните поле»', () => {
    const values = filled({ purchaseCost: '', commissionBase: 'custom', commissionBaseAmount: '' })
    const calculation = calculateProfit(formToInput(values))
    if (calculation.ok) throw new Error('ожидались ошибки')
    expect(mapErrorsToForm(calculation.errors, values)).toEqual({
      purchaseCost: 'Заполните поле',
      commissionBaseAmount: 'Заполните поле',
    })
  })
})

describe('validateForSave', () => {
  it('требует название товара', () => {
    expect(validateForSave(filled({ productName: '   ' }))).toEqual({ productName: 'Введите название товара' })
    expect(validateForSave(filled())).toEqual({})
  })
})
