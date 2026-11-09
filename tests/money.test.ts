import { describe, expect, it } from 'vitest'
import { ceilToKopecks, formatRub, roundToKopecks } from '../src/calculations/money'

describe('roundToKopecks', () => {
  it('округляет до двух знаков', () => {
    expect(roundToKopecks(10.005)).toBe(10.01)
    expect(roundToKopecks(0.1 + 0.2)).toBe(0.3)
  })

  it('корректно работает с отрицательными суммами (убыток)', () => {
    expect(roundToKopecks(-12.344)).toBe(-12.34)
    expect(roundToKopecks(-1.005)).toBe(-1.01)
  })

  it('не возвращает -0', () => {
    expect(Object.is(roundToKopecks(-0.001), 0)).toBe(true)
  })
})

describe('ceilToKopecks', () => {
  it('округляет вверх до копейки', () => {
    expect(ceilToKopecks(937.501)).toBe(937.51)
    expect(ceilToKopecks(401.6144)).toBe(401.62)
  })

  it('не завышает точные значения из-за плавающей точки', () => {
    expect(ceilToKopecks(0.1 + 0.2)).toBe(0.3)
    expect(ceilToKopecks(117.65)).toBe(117.65)
  })
})

describe('formatRub', () => {
  it('форматирует сумму в рублях по-русски', () => {
    // Intl использует неразрывные пробелы — нормализуем их для сравнения
    expect(formatRub(1234.5).replace(/\s/g, ' ')).toBe('1 234,5 ₽')
  })
})
