import type { ProfitInput } from './profit'

/** Товар, сохранённый пользователем. Результаты расчёта не хранятся — они всегда пересчитываются. */
export interface SavedProduct {
  id: string
  input: ProfitInput
  /** ISO-дата. */
  createdAt: string
  /** ISO-дата. */
  updatedAt: string
}
