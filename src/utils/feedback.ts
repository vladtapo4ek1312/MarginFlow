/**
 * Отзыв бета-тестировщика. Бэкенда нет: отзыв собирается в текст,
 * который пользователь копирует и отправляет организаторам сам.
 */

export type FeedbackMarketplace = 'wildberries' | 'ozon' | 'both'
export type FeedbackEase = '1' | '2' | '3' | '4' | '5'
export type FeedbackRegularUse = 'yes' | 'maybe' | 'no'

export interface FeedbackValues {
  /** Пустая строка — не выбрано. */
  marketplace: FeedbackMarketplace | ''
  ease: FeedbackEase | ''
  confusing: string
  missingFeature: string
  regularUse: FeedbackRegularUse | ''
  contact: string
}

export type FeedbackField = keyof FeedbackValues
export type FeedbackErrors = Partial<Record<FeedbackField | 'text', string>>

export const FEEDBACK_TEXT_MAX = 2000
export const FEEDBACK_CONTACT_MAX = 120

export const MARKETPLACE_OPTIONS: readonly { value: FeedbackMarketplace; label: string }[] = [
  { value: 'wildberries', label: 'Wildberries' },
  { value: 'ozon', label: 'Ozon' },
  { value: 'both', label: 'Оба' },
]

export const EASE_OPTIONS: readonly { value: FeedbackEase; label: string }[] = [
  { value: '1', label: 'Очень сложно' },
  { value: '2', label: 'Сложно' },
  { value: '3', label: 'Нормально' },
  { value: '4', label: 'Легко' },
  { value: '5', label: 'Очень легко' },
]

export const REGULAR_USE_OPTIONS: readonly { value: FeedbackRegularUse; label: string }[] = [
  { value: 'yes', label: 'Да' },
  { value: 'maybe', label: 'Возможно' },
  { value: 'no', label: 'Нет' },
]

export function emptyFeedback(): FeedbackValues {
  return { marketplace: '', ease: '', confusing: '', missingFeature: '', regularUse: '', contact: '' }
}

export type SensitiveKind = 'card' | 'account' | 'secret' | 'token'

const SENSITIVE_MESSAGES: Record<SensitiveKind, string> = {
  card: 'Похоже на номер банковской карты. Удалите его — для отзыва он не нужен.',
  account: 'Похоже на номер банковского счёта. Удалите его — для отзыва он не нужен.',
  secret: 'Похоже на пароль или ключ доступа. Не указывайте пароли и ключи API.',
  token: 'Похоже на ключ API или токен. Не указывайте ключи доступа к маркетплейсам.',
}

/** Алгоритм Луна — отличает номер карты от случайной последовательности цифр (например, телефона). */
export function passesLuhn(digits: string): boolean {
  let sum = 0
  for (let i = 0; i < digits.length; i++) {
    let digit = Number(digits[digits.length - 1 - i])
    if (i % 2 === 1) {
      digit *= 2
      if (digit > 9) digit -= 9
    }
    sum += digit
  }
  return sum % 10 === 0
}

// Пароль/ключ «с присвоением»: «пароль: qwerty», «api_key=...». Простое упоминание слова не блокируем.
const SECRET_ASSIGNMENT =
  /(пароль|парол[яею]|password|passwd|pwd|api[\s_-]?key|апи[\s-]?ключ|ключ\s+api|токен|token|secret|секрет|cvv|cvc|пин[\s-]?код|pin)\s*[:=]\s*\S/i

/** Длинная строка из букв и цифр без пробелов — типичный вид ключа API или токена. */
const TOKEN_LIKE = /[A-Za-z0-9_\-.]{32,}/g

/**
 * Кандидаты в номера карт и счетов: сплошные цифры или стандартная группировка
 * (карта — по 4 цифры, счёт — 5-3-1-4-7). Список цен через пробел не подходит.
 */
const NUMBER_CANDIDATES = [
  /\d{13,}/g,
  /(?<!\d)\d{4}(?:[ -]\d{4}){2}[ -]\d{1,7}(?!\d)/g,
  /(?<!\d)\d{5}[ -]\d{3}[ -]\d[ -]\d{4}[ -]\d{7}(?!\d)/g,
]

/**
 * Ищет в тексте данные, которые нельзя собирать: номера карт и счетов, пароли, ключи API.
 * Срабатывает с запасом — лучше попросить убрать лишнее, чем принять секрет.
 */
export function detectSensitiveData(text: string): SensitiveKind | null {
  if (SECRET_ASSIGNMENT.test(text)) return 'secret'

  for (const match of text.match(TOKEN_LIKE) ?? []) {
    if (/[A-Za-z]/.test(match) && /\d/.test(match)) return 'token'
  }

  for (const pattern of NUMBER_CANDIDATES) {
    for (const match of text.match(pattern) ?? []) {
      const digits = match.replace(/\D/g, '')
      // 20 цифр — номер расчётного счёта в российских банках.
      if (digits.length >= 20) return 'account'
      if (digits.length >= 13 && digits.length <= 19 && passesLuhn(digits)) return 'card'
    }
  }
  return null
}

export function validateFeedback(values: FeedbackValues): FeedbackErrors {
  const errors: FeedbackErrors = {}

  if (values.confusing.trim() === '' && values.missingFeature.trim() === '') {
    errors.text = 'Напишите хотя бы пару слов: что было непонятно или чего не хватает'
  }

  for (const field of ['confusing', 'missingFeature'] as const) {
    if (values[field].length > FEEDBACK_TEXT_MAX) {
      errors[field] = `Не больше ${FEEDBACK_TEXT_MAX} символов`
    }
  }
  if (values.contact.length > FEEDBACK_CONTACT_MAX) {
    errors.contact = `Не больше ${FEEDBACK_CONTACT_MAX} символов`
  }

  for (const field of ['confusing', 'missingFeature', 'contact'] as const) {
    if (errors[field]) continue
    const kind = detectSensitiveData(values[field])
    if (kind) errors[field] = SENSITIVE_MESSAGES[kind]
  }

  return errors
}

function labelOf<T extends string>(options: readonly { value: T; label: string }[], value: T | ''): string {
  return options.find((o) => o.value === value)?.label ?? 'не указано'
}

const dateFormatter = new Intl.DateTimeFormat('ru-RU', { dateStyle: 'long' })

/** Текст отзыва для копирования в чат или письмо. */
export function buildFeedbackText(values: FeedbackValues, date = new Date()): string {
  const ease = values.ease === '' ? 'не указано' : `${values.ease} из 5 — ${labelOf(EASE_OPTIONS, values.ease)}`
  const answer = (text: string) => (text.trim() === '' ? 'не указано' : text.trim())

  return [
    'Отзыв о MarginFlow (бета)',
    `Дата: ${dateFormatter.format(date)}`,
    '',
    `Маркетплейс: ${labelOf(MARKETPLACE_OPTIONS, values.marketplace)}`,
    `Насколько легко пользоваться калькулятором: ${ease}`,
    `Буду пользоваться регулярно: ${labelOf(REGULAR_USE_OPTIONS, values.regularUse)}`,
    '',
    'Что было непонятно:',
    answer(values.confusing),
    '',
    'Какой функции не хватает:',
    answer(values.missingFeature),
    '',
    `Контакт для связи: ${answer(values.contact)}`,
  ].join('\n')
}
