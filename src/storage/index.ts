/**
 * Локальное хранение данных пользователя (localStorage).
 * Бэкенда нет — все данные остаются в браузере.
 */

export const STORAGE_PREFIX = 'marginflow:'

export function storageKey(name: string): string {
  return `${STORAGE_PREFIX}${name}`
}
