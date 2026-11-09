import { describe, expect, it, vi } from 'vitest'
import { copyText } from '../src/utils/clipboard'
import {
  buildFeedbackText,
  detectSensitiveData,
  emptyFeedback,
  FEEDBACK_CONTACT_MAX,
  FEEDBACK_TEXT_MAX,
  passesLuhn,
  validateFeedback,
  type FeedbackValues,
} from '../src/utils/feedback'

function feedback(overrides: Partial<FeedbackValues> = {}): FeedbackValues {
  return { ...emptyFeedback(), ...overrides }
}

describe('validateFeedback — обязательные поля', () => {
  it('пустая форма: требуется только текст отзыва', () => {
    expect(validateFeedback(emptyFeedback())).toEqual({
      text: 'Напишите хотя бы пару слов: что было непонятно или чего не хватает',
    })
  })

  it('пробелы не считаются текстом', () => {
    expect(validateFeedback(feedback({ confusing: '   \n ' })).text).toBeDefined()
  })

  it.each([
    ['confusing', 'Не понял базу комиссии'],
    ['missingFeature', 'Нужен импорт из Excel'],
  ] as const)('достаточно заполнить одно текстовое поле: %s', (field, text) => {
    expect(validateFeedback(feedback({ [field]: text }))).toEqual({})
  })

  it('остальные поля необязательны', () => {
    const values = feedback({ confusing: 'Всё понятно' })
    expect(values.marketplace).toBe('')
    expect(values.ease).toBe('')
    expect(values.regularUse).toBe('')
    expect(values.contact).toBe('')
    expect(validateFeedback(values)).toEqual({})
  })

  it('ограничивает длину текста и контакта', () => {
    const errors = validateFeedback(
      feedback({ confusing: 'а'.repeat(FEEDBACK_TEXT_MAX + 1), contact: 'б'.repeat(FEEDBACK_CONTACT_MAX + 1) }),
    )
    expect(errors.confusing).toMatch(/Не больше/)
    expect(errors.contact).toMatch(/Не больше/)
    expect(validateFeedback(feedback({ confusing: 'а'.repeat(FEEDBACK_TEXT_MAX) }))).toEqual({})
  })
})

describe('detectSensitiveData — не пропускает секреты', () => {
  it.each([
    ['5555 5555 5555 4444', 'card'],
    ['карта 5555-5555-5555-4444', 'card'],
    ['4111111111111111', 'card'],
    ['счёт 40817810000000000001', 'account'],
    ['40817 810 0 0000 0000001', 'account'],
    ['пароль: qwerty123', 'secret'],
    ['Password=hunter2', 'secret'],
    ['API key: abc', 'secret'],
    ['мой токен = xyz', 'secret'],
    ['CVV: 123', 'secret'],
    ['eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9abcdef123456', 'token'],
    ['ключ a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8', 'token'],
  ] as const)('«%s» → %s', (text, kind) => {
    expect(detectSensitiveData(text)).toBe(kind)
  })

  it('блокирует отправку, если секрет в любом текстовом поле или контакте', () => {
    expect(validateFeedback(feedback({ confusing: 'пароль: 12345' })).confusing).toMatch(/пароль/)
    expect(validateFeedback(feedback({ confusing: 'ok', missingFeature: '4111 1111 1111 1111' })).missingFeature).toMatch(
      /карты/,
    )
    expect(validateFeedback(feedback({ confusing: 'ok', contact: 'token: abc' })).contact).toMatch(/ключ/i)
  })
})

describe('detectSensitiveData — без ложных срабатываний', () => {
  it.each([
    'Не понял, где ввести пароль от кабинета — его же не нужно вводить?',
    'Хотелось бы подключить API Wildberries',
    'Цены: 1500 500 80 10 15 50 90 5 и комиссия 20 %',
    '+7 900 123-45-67',
    '89001234567',
    '@seller_ivan',
    'ivan.petrov@example.ru',
    'Артикул 123456789 считается неправильно',
    'https://www.wildberries.ru/catalog/123456789/detail.aspx',
    '1234 5678 9012 3456', // не проходит проверку Луна
  ])('«%s»', (text) => {
    expect(detectSensitiveData(text)).toBeNull()
  })

  it('passesLuhn', () => {
    expect(passesLuhn('4111111111111111')).toBe(true)
    expect(passesLuhn('4111111111111112')).toBe(false)
  })
})

describe('buildFeedbackText', () => {
  const date = new Date(2026, 10, 9)

  it('собирает все ответы в читаемый текст', () => {
    const text = buildFeedbackText(
      {
        marketplace: 'both',
        ease: '4',
        confusing: '  База комиссии  ',
        missingFeature: 'Импорт из Excel',
        regularUse: 'maybe',
        contact: '@seller',
      },
      date,
    )
    expect(text).toBe(
      [
        'Отзыв о MarginFlow (бета)',
        'Дата: 9 ноября 2026 г.',
        '',
        'Маркетплейс: Оба',
        'Насколько легко пользоваться калькулятором: 4 из 5 — Легко',
        'Буду пользоваться регулярно: Возможно',
        '',
        'Что было непонятно:',
        'База комиссии',
        '',
        'Какой функции не хватает:',
        'Импорт из Excel',
        '',
        'Контакт для связи: @seller',
      ].join('\n'),
    )
  })

  it('пропущенные ответы помечает как «не указано»', () => {
    const text = buildFeedbackText(feedback({ missingFeature: 'Графики' }), date)
    expect(text).toContain('Маркетплейс: не указано')
    expect(text).toContain('калькулятором: не указано')
    expect(text).toContain('регулярно: не указано')
    expect(text).toContain('Что было непонятно:\nне указано')
    expect(text).toContain('Контакт для связи: не указано')
    expect(text).not.toMatch(/undefined|null/)
  })
})

describe('copyText', () => {
  it('использует Clipboard API', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined)
    expect(await copyText('отзыв', { clipboard: { writeText } })).toBe(true)
    expect(writeText).toHaveBeenCalledWith('отзыв')
  })

  it('при отказе Clipboard API пробует запасной способ', async () => {
    const legacyCopy = vi.fn().mockReturnValue(true)
    const clipboard = { writeText: vi.fn().mockRejectedValue(new Error('NotAllowedError')) }
    expect(await copyText('отзыв', { clipboard, legacyCopy })).toBe(true)
    expect(legacyCopy).toHaveBeenCalledWith('отзыв')
  })

  it('без доступных способов возвращает false, а не бросает исключение', async () => {
    expect(await copyText('отзыв', {})).toBe(false)
    expect(await copyText('отзыв', { legacyCopy: () => false })).toBe(false)
  })
})
