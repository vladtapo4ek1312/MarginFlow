export interface ClipboardEnv {
  clipboard?: Pick<Clipboard, 'writeText'>
  /** Запасной способ для старых браузеров и страниц без HTTPS. */
  legacyCopy?: (text: string) => boolean
}

function legacyCopy(text: string): boolean {
  const textarea = document.createElement('textarea')
  textarea.value = text
  textarea.setAttribute('readonly', '')
  textarea.style.position = 'fixed'
  textarea.style.opacity = '0'
  document.body.append(textarea)
  textarea.select()
  try {
    return document.execCommand('copy')
  } catch {
    return false
  } finally {
    textarea.remove()
  }
}

function browserEnv(): ClipboardEnv {
  return {
    clipboard: typeof navigator !== 'undefined' ? navigator.clipboard : undefined,
    legacyCopy: typeof document !== 'undefined' ? legacyCopy : undefined,
  }
}

/** Копирует текст в буфер обмена. Никогда не бросает исключение: возвращает false при неудаче. */
export async function copyText(text: string, env: ClipboardEnv = browserEnv()): Promise<boolean> {
  if (env.clipboard) {
    try {
      await env.clipboard.writeText(text)
      return true
    } catch {
      // Например, нет разрешения — пробуем запасной способ.
    }
  }
  return env.legacyCopy ? env.legacyCopy(text) : false
}
