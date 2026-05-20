const MULTIPLE_SPACES = /\s+/g
const EMAIL_PATTERN =
  /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi
const PHONE_PATTERN =
  /\b(?:\+?\d{1,3}\s*)?(?:\(?\d{2,3}\)?\s*)?\d{4,5}[-\s]?\d{4}\b/g

export function sanitizeTextInput(value: string) {
  return stripControlCharacters(value).replace(MULTIPLE_SPACES, ' ').trim()
}

export function redactSensitiveText(value: string) {
  return sanitizeTextInput(value)
    .replace(EMAIL_PATTERN, '[redacted-email]')
    .replace(PHONE_PATTERN, '[redacted-phone]')
}

export function sanitizeOptionalText(value?: string) {
  if (!value) {
    return undefined
  }

  const sanitized = sanitizeTextInput(value)
  return sanitized.length > 0 ? sanitized : undefined
}

export function sanitizeOptionalSensitiveText(value?: string) {
  if (!value) {
    return undefined
  }

  const sanitized = redactSensitiveText(value)
  return sanitized.length > 0 ? sanitized : undefined
}

function stripControlCharacters(value: string) {
  return Array.from(value)
    .filter((character) => {
      const code = character.charCodeAt(0)
      return !(code <= 31 || code === 127)
    })
    .join('')
}
