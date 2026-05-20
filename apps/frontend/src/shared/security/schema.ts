import { z } from 'zod'
import {
  sanitizeOptionalSensitiveText,
  sanitizeOptionalText,
  sanitizeTextInput
} from '@/shared/security/text'

export function safeTextField(maxLength: number) {
  return z.string().transform(sanitizeTextInput).pipe(z.string().min(1).max(maxLength))
}

export function safeOptionalTextField(maxLength: number) {
  return z
    .string()
    .transform((value) => sanitizeOptionalText(value))
    .optional()
    .refine((value) => value === undefined || value.length <= maxLength)
}

export function safeOptionalSensitiveTextField(maxLength: number) {
  return z
    .string()
    .transform((value) => sanitizeOptionalSensitiveText(value))
    .optional()
    .refine((value) => value === undefined || value.length <= maxLength)
}
