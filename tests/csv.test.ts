import { describe, expect, it } from 'vitest'
import { buildProductsCsv, csvFileName, escapeCell, UTF8_BOM } from '../src/utils/csv'
import { withResults } from '../src/utils/products'
import { makeProduct } from './fixtures'

describe('buildProductsCsv', () => {
  const csv = buildProductsCsv(
    withResults([
      makeProduct('a', { productName: 'Футболка; белая "оверсайз"' }),
      makeProduct('b', {
        productName: 'Худи',
        marketplace: 'ozon',
        sellingPrice: 0,
        commission: { type: 'fixed', amount: 120.5 },
      }),
    ]),
  )
  const lines = csv.slice(UTF8_BOM.length).trimEnd().split('\r\n')

  it('начинается с UTF-8 BOM', () => {
    expect(csv.startsWith('﻿')).toBe(true)
  })

  it('содержит заголовок и строку на каждый товар', () => {
    expect(lines).toHaveLength(3)
    expect(lines[0]).toContain('Чистая прибыль, ₽')
    expect(lines[0].split(';')).toHaveLength(17)
  })

  it('экранирует разделители и кавычки, числа пишет с запятой', () => {
    expect(lines[1]).toBe(
      '"Футболка; белая ""оверсайз"""' +
        ';Wildberries;1500;500;20 % от цены продажи;300;80;10;15;50;90;5;1050;450;30;200;937,5',
    )
  })

  it('неопределённые значения оставляет пустыми, а не NaN', () => {
    expect(lines[2]).toBe('Худи;Ozon;0;500;Фиксированная, 120,5 ₽;120,5;80;10;15;50;90;5;870,5;-870,5;;-100;870,5')
    expect(csv).not.toMatch(/NaN|Infinity|null|undefined/)
  })
})

describe('escapeCell', () => {
  it('защищает пользовательский текст от формул Excel', () => {
    expect(escapeCell('=HYPERLINK("x")', true)).toBe('"\'=HYPERLINK(""x"")"')
    expect(escapeCell('+79001234567', true)).toBe("'+79001234567")
    expect(escapeCell('Обычный текст', true)).toBe('Обычный текст')
  })
})

describe('csvFileName', () => {
  it('содержит дату', () => {
    expect(csvFileName(new Date(2026, 10, 9))).toBe('marginflow-tovary-2026-11-09.csv')
  })
})
