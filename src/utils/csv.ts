import { MARKETPLACE_LABELS } from '../types'
import { describeCommission } from './commission'
import type { ProductWithResult } from './products'

/** Excel узнаёт UTF-8 по BOM — иначе кириллица превращается в «кракозябры». */
export const UTF8_BOM = '﻿'
/** Русский Excel по умолчанию ожидает точку с запятой. */
const SEPARATOR = ';'

/** Число с запятой — так его распознает русский Excel. */
function formatNumber(value: number | null): string {
  return value === null ? '' : String(value).replace('.', ',')
}

/** Экранирует ячейку и защищает от CSV-инъекций формул в пользовательском тексте. */
export function escapeCell(value: string, isUserText = false): string {
  const safe = isUserText && /^[=+\-@\t\r]/.test(value) ? `'${value}` : value
  return /[";\r\n]/.test(safe) ? `"${safe.replace(/"/g, '""')}"` : safe
}

const HEADERS = [
  'Название',
  'Маркетплейс',
  'Цена продажи, ₽',
  'Закупочная цена, ₽',
  'Тип комиссии',
  'Комиссия, ₽',
  'Логистика, ₽',
  'Хранение, ₽',
  'Упаковка, ₽',
  'Реклама, ₽',
  'Налог, ₽',
  'Прочие расходы, ₽',
  'Общие расходы, ₽',
  'Чистая прибыль, ₽',
  'Рентабельность, %',
  'Наценка, %',
  'Точка безубыточности, ₽',
]

export function buildProductsCsv(rows: ProductWithResult[]): string {
  const lines = [HEADERS.map((h) => escapeCell(h)).join(SEPARATOR)]

  for (const { product, result } of rows) {
    const e = result.expenses
    const cells = [
      escapeCell(result.productName, true),
      MARKETPLACE_LABELS[result.marketplace],
      formatNumber(result.sellingPrice),
      formatNumber(e.purchaseCost),
      escapeCell(describeCommission(product.input.commission, (n) => `${formatNumber(n)} ₽`)),
      formatNumber(e.commission),
      formatNumber(e.logistics),
      formatNumber(e.storage),
      formatNumber(e.packaging),
      formatNumber(e.advertising),
      formatNumber(e.tax),
      formatNumber(e.otherExpenses),
      formatNumber(result.totalExpenses),
      formatNumber(result.netProfit),
      formatNumber(result.marginPercent),
      formatNumber(result.markupPercent),
      formatNumber(result.breakEvenPrice),
    ]
    lines.push(cells.join(SEPARATOR))
  }

  return UTF8_BOM + lines.join('\r\n') + '\r\n'
}

export function csvFileName(date = new Date()): string {
  const pad = (n: number) => String(n).padStart(2, '0')
  return `marginflow-tovary-${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}.csv`
}

/** Скачивание файла в браузере без внешних библиотек. */
export function downloadCsv(content: string, fileName: string): void {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = fileName
  document.body.append(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
}
