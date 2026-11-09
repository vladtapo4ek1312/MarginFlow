import { describe, expect, it } from 'vitest'
import {
  calculateBreakEvenPrice,
  calculateCommission,
  calculateProfit,
  validateProfitInput,
} from '../src/calculations/profit'
import type { ProfitInput, ProfitResult } from '../src/types/profit'

/**
 * Базовый прибыльный товар:
 * комиссия 20 % от 1500 = 300; прочие расходы 500 + 80 + 10 + 15 + 50 + 90 + 5 = 750;
 * итого 1050, прибыль 450.
 */
const baseInput: ProfitInput = {
  marketplace: 'wildberries',
  productName: '  Футболка оверсайз  ',
  sellingPrice: 1500,
  purchaseCost: 500,
  commission: { type: 'percent', rate: 20, base: { kind: 'sellingPrice' } },
  logistics: 80,
  storage: 10,
  packaging: 15,
  advertising: 50,
  tax: 90,
  otherExpenses: 5,
}

function input(overrides: Partial<ProfitInput> = {}): ProfitInput {
  return { ...baseInput, ...overrides }
}

function calc(overrides: Partial<ProfitInput> = {}): ProfitResult {
  const calculation = calculateProfit(input(overrides))
  if (!calculation.ok) {
    throw new Error(`Unexpected validation errors: ${JSON.stringify(calculation.errors)}`)
  }
  return calculation.result
}

function errorFields(overrides: Record<string, unknown>): string[] {
  const calculation = calculateProfit({ ...baseInput, ...overrides } as ProfitInput)
  return calculation.ok ? [] : calculation.errors.map((e) => e.field)
}

describe('calculateProfit — прибыльный товар', () => {
  it('считает расходы, прибыль, маржу, наценку и точку безубыточности', () => {
    const r = calc()

    expect(r.expenses).toEqual({
      purchaseCost: 500,
      commission: 300,
      logistics: 80,
      storage: 10,
      packaging: 15,
      advertising: 50,
      tax: 90,
      otherExpenses: 5,
    })
    expect(r.totalExpenses).toBe(1050)
    expect(r.netProfit).toBe(450)
    expect(r.marginPercent).toBe(30)
    expect(r.markupPercent).toBe(200)
    expect(r.breakEvenPrice).toBe(937.5)
    expect(r.status).toBe('profit')
  })

  it('сохраняет маркетплейс и обрезает пробелы в названии', () => {
    const r = calc()
    expect(r.marketplace).toBe('wildberries')
    expect(r.productName).toBe('Футболка оверсайз')
  })

  it('не подставляет ставки маркетплейса: Ozon с теми же данными даёт тот же результат', () => {
    const { marketplace: _wb, ...wb } = calc()
    const { marketplace: _ozon, ...ozon } = calc({ marketplace: 'ozon' })
    expect(ozon).toEqual(wb)
  })
})

describe('calculateProfit — убыточный товар', () => {
  it('возвращает отрицательную прибыль и маржу', () => {
    // комиссия 20 % от 700 = 140; расходы 750 + 140 = 890
    const r = calc({ sellingPrice: 700 })

    expect(r.expenses.commission).toBe(140)
    expect(r.totalExpenses).toBe(890)
    expect(r.netProfit).toBe(-190)
    expect(r.marginPercent).toBe(-27.14)
    expect(r.markupPercent).toBe(40)
    expect(r.status).toBe('loss')
    expect(r.breakEvenPrice).toBe(937.5)
  })

  it('отрицательная наценка, если цена ниже закупки', () => {
    const r = calc({ sellingPrice: 400 })
    expect(r.markupPercent).toBe(-20)
    expect(r.status).toBe('loss')
  })
})

describe('calculateProfit — нулевая цена продажи', () => {
  it('маржа не определена, деления на ноль нет', () => {
    const r = calc({ sellingPrice: 0 })

    expect(r.expenses.commission).toBe(0)
    expect(r.totalExpenses).toBe(750)
    expect(r.netProfit).toBe(-750)
    expect(r.marginPercent).toBeNull()
    expect(r.markupPercent).toBe(-100)
    expect(r.breakEvenPrice).toBe(937.5)
    expect(r.status).toBe('loss')
  })
})

describe('calculateProfit — нулевая закупочная стоимость', () => {
  it('наценка не определена, остальное считается', () => {
    // расходы без комиссии: 250; комиссия 300
    const r = calc({ purchaseCost: 0 })

    expect(r.totalExpenses).toBe(550)
    expect(r.netProfit).toBe(950)
    expect(r.marginPercent).toBe(63.33)
    expect(r.markupPercent).toBeNull()
    expect(r.breakEvenPrice).toBe(312.5)
  })

  it('все значения нулевые — результат нулевой, без NaN', () => {
    const r = calc({
      sellingPrice: 0,
      purchaseCost: 0,
      logistics: 0,
      storage: 0,
      packaging: 0,
      advertising: 0,
      tax: 0,
      otherExpenses: 0,
    })

    expect(r.totalExpenses).toBe(0)
    expect(r.netProfit).toBe(0)
    expect(r.marginPercent).toBeNull()
    expect(r.markupPercent).toBeNull()
    expect(r.breakEvenPrice).toBe(0)
    expect(r.status).toBe('breakeven')
  })
})

describe('calculateProfit — фиксированная комиссия', () => {
  it('вычитает фиксированную сумму независимо от цены', () => {
    const commission = { type: 'fixed', amount: 250 } as const

    const r = calc({ commission })
    expect(r.expenses.commission).toBe(250)
    expect(r.totalExpenses).toBe(1000)
    expect(r.netProfit).toBe(500)
    expect(r.breakEvenPrice).toBe(1000)

    expect(calc({ commission, sellingPrice: 3000 }).expenses.commission).toBe(250)
  })

  it('округляет дробную сумму комиссии до копеек', () => {
    expect(calculateCommission({ type: 'fixed', amount: 99.999 }, 1000, 500)).toBe(100)
  })
})

describe('calculateProfit — процентная комиссия', () => {
  it('от цены продажи', () => {
    expect(
      calculateCommission({ type: 'percent', rate: 15, base: { kind: 'sellingPrice' } }, 1200, 500),
    ).toBe(180)
  })

  it('от закупочной стоимости', () => {
    const r = calc({
      commission: { type: 'percent', rate: 10, base: { kind: 'purchaseCost' } },
    })
    expect(r.expenses.commission).toBe(50)
    expect(r.netProfit).toBe(700)
    // комиссия не зависит от цены продажи: 750 + 50
    expect(r.breakEvenPrice).toBe(800)
  })

  it('от произвольной базы', () => {
    const r = calc({
      commission: { type: 'percent', rate: 15, base: { kind: 'custom', amount: 2000 } },
    })
    expect(r.expenses.commission).toBe(300)
    expect(r.breakEvenPrice).toBe(1050)
  })

  it('дробная ставка и цена округляются до копеек', () => {
    // 999.99 × 17.5 % = 174.99825 → 175.00
    expect(
      calculateCommission({ type: 'percent', rate: 17.5, base: { kind: 'sellingPrice' } }, 999.99, 0),
    ).toBe(175)
    // 333.33 × 4.5 % = 14.99985 → 15.00
    expect(
      calculateCommission({ type: 'percent', rate: 4.5, base: { kind: 'sellingPrice' } }, 333.33, 0),
    ).toBe(15)
  })

  it('нулевая ставка — комиссии нет', () => {
    const r = calc({ commission: { type: 'percent', rate: 0, base: { kind: 'sellingPrice' } } })
    expect(r.expenses.commission).toBe(0)
    expect(r.breakEvenPrice).toBe(750)
  })
})

describe('точка безубыточности', () => {
  it('при цене, равной точке безубыточности, прибыль равна нулю', () => {
    const r = calc({ sellingPrice: 937.5 })
    expect(r.netProfit).toBe(0)
    expect(r.marginPercent).toBe(0)
    expect(r.status).toBe('breakeven')
  })

  it('учитывает округление комиссии: формула дала бы 663.19, но 663.18 уже безубыточна', () => {
    // C = 550.44, r = 17 %: 550.44 / 0.83 = 663.1807…; комиссия с 663.18 = 112.7406 → 112.74
    const r = calc({
      purchaseCost: 333.33,
      logistics: 47.11,
      commission: { type: 'percent', rate: 17, base: { kind: 'sellingPrice' } },
    })
    expect(r.breakEvenPrice).toBe(663.18)
  })

  it('точна и при очень высокой ставке, где соседние цены дают одинаковую прибыль', () => {
    const highRate = input({
      purchaseCost: 522.86,
      logistics: 254.95,
      storage: 41.99,
      packaging: 22.56,
      advertising: 84.35,
      tax: 420.79,
      otherExpenses: 4.55,
      commission: { type: 'percent', rate: 89.94, base: { kind: 'sellingPrice' } },
    })
    const breakEven = calc(highRate).breakEvenPrice!
    expect(calc({ ...highRate, sellingPrice: breakEven }).netProfit).toBeGreaterThanOrEqual(0)
    expect(calc({ ...highRate, sellingPrice: breakEven - 0.01 }).netProfit).toBeLessThan(0)
  })

  it('минимальна: на точке прибыль ≥ 0, на копейку ниже — убыток', () => {
    const awkward = input({
      purchaseCost: 333.33,
      logistics: 47.11,
      commission: { type: 'percent', rate: 17, base: { kind: 'sellingPrice' } },
    })
    const breakEven = calc(awkward).breakEvenPrice
    expect(breakEven).not.toBeNull()

    const atBreakEven = calc({ ...awkward, sellingPrice: breakEven! })
    const justBelow = calc({ ...awkward, sellingPrice: breakEven! - 0.01 })
    expect(atBreakEven.netProfit).toBeGreaterThanOrEqual(0)
    expect(justBelow.netProfit).toBeLessThan(0)
  })

  it('недостижима при комиссии 100 % от цены продажи', () => {
    const r = calc({ commission: { type: 'percent', rate: 100, base: { kind: 'sellingPrice' } } })
    expect(r.breakEvenPrice).toBeNull()
    expect(r.netProfit).toBe(-750)
  })

  it('при комиссии 100 % и нулевых прочих расходах равна нулю', () => {
    const percent100 = { type: 'percent', rate: 100, base: { kind: 'sellingPrice' } } as const
    expect(calculateBreakEvenPrice(percent100, 0, 0)).toBe(0)
  })

  it('с фиксированной комиссией — сумма всех расходов', () => {
    expect(calculateBreakEvenPrice({ type: 'fixed', amount: 120.5 }, 879.5, 120.5)).toBe(1000)
  })
})

describe('валидация входных данных', () => {
  it('корректные данные проходят без ошибок', () => {
    expect(validateProfitInput(baseInput)).toEqual([])
  })

  it.each([
    'sellingPrice',
    'purchaseCost',
    'logistics',
    'storage',
    'packaging',
    'advertising',
    'tax',
    'otherExpenses',
  ] as const)('отклоняет отрицательное значение: %s', (field) => {
    const calculation = calculateProfit(input({ [field]: -1 }))
    expect(calculation.ok).toBe(false)
    if (!calculation.ok) {
      expect(calculation.errors).toEqual([
        { field, message: 'Значение не может быть отрицательным' },
      ])
    }
  })

  it.each([NaN, Infinity, -Infinity, '100', undefined, null])(
    'отклоняет нечисловое значение цены: %s',
    (value) => {
      expect(errorFields({ sellingPrice: value })).toEqual(['sellingPrice'])
    },
  )

  it('отклоняет отрицательную фиксированную комиссию', () => {
    expect(errorFields({ commission: { type: 'fixed', amount: -10 } })).toEqual([
      'commission.amount',
    ])
  })

  it.each([-5, 100.01, NaN])('отклоняет ставку комиссии вне 0–100: %s', (rate) => {
    expect(
      errorFields({ commission: { type: 'percent', rate, base: { kind: 'sellingPrice' } } }),
    ).toEqual(['commission.rate'])
  })

  it('отклоняет отрицательную произвольную базу комиссии', () => {
    expect(
      errorFields({ commission: { type: 'percent', rate: 10, base: { kind: 'custom', amount: -1 } } }),
    ).toEqual(['commission.base.amount'])
  })

  it('отклоняет неизвестную базу и тип комиссии', () => {
    expect(
      errorFields({ commission: { type: 'percent', rate: 10, base: { kind: 'revenue' } } }),
    ).toEqual(['commission.base'])
    expect(errorFields({ commission: { type: 'tiered' } })).toEqual(['commission'])
    expect(errorFields({ commission: null })).toEqual(['commission'])
  })

  it('отклоняет неизвестный маркетплейс', () => {
    expect(errorFields({ marketplace: 'yandex' })).toEqual(['marketplace'])
    expect(errorFields({ marketplace: 'toString' })).toEqual(['marketplace'])
  })

  it('собирает все ошибки сразу', () => {
    expect(errorFields({ sellingPrice: -1, logistics: NaN, tax: -0.01 })).toEqual([
      'sellingPrice',
      'logistics',
      'tax',
    ])
  })
})

describe('округление до копеек', () => {
  it('не накапливает ошибки плавающей точки', () => {
    const r = calc({
      sellingPrice: 0.3,
      purchaseCost: 0.1,
      commission: { type: 'fixed', amount: 0 },
      logistics: 0.2,
      storage: 0,
      packaging: 0,
      advertising: 0,
      tax: 0,
      otherExpenses: 0,
    })
    expect(r.totalExpenses).toBe(0.3)
    expect(r.netProfit).toBe(0)
    expect(r.status).toBe('breakeven')
  })

  it('округляет дробные копейки во входных данных', () => {
    const r = calc({ logistics: 80.004, storage: 10.005 })
    expect(r.expenses.logistics).toBe(80)
    expect(r.expenses.storage).toBe(10.01)
  })
})
