import { z } from 'zod'
import { nowIsoString } from '@/shared/lib/time'
import { safeTextField } from '@/shared/security/schema'

export const currencyCodeSchema = z.string().trim().length(3).toUpperCase()
const dataImageUrlSchema = z
  .string()
  .trim()
  .startsWith('data:image/', 'Logo local invalida')

export const settingsSchema = z.object({
  establishmentName: safeTextField(120),
  currencyCode: currencyCodeSchema,
  locale: safeTextField(35),
  logoImageUrl: dataImageUrlSchema.optional(),
  showClosedOrders: z.boolean(),
  shareSensitiveData: z.boolean(),
  printIntegrationEnabled: z.boolean(),
  diagnosticsEnabled: z.boolean(),
  whatsappIntegrationEnabled: z.boolean(),
  updatedAt: z.iso.datetime()
})

export type Settings = z.infer<typeof settingsSchema>

export function createDefaultSettings() {
  return settingsSchema.parse({
    establishmentName: 'OpenOrder',
    currencyCode: 'BRL',
    locale: 'pt-BR',
    logoImageUrl: undefined,
    showClosedOrders: false,
    shareSensitiveData: false,
    printIntegrationEnabled: false,
    diagnosticsEnabled: false,
    whatsappIntegrationEnabled: false,
    updatedAt: new Date().toISOString()
  })
}

export type UpdateSettingsInput = Partial<
  Omit<Settings, 'updatedAt'>
> & {
  settings: Settings
}

export function updateSettings(input: UpdateSettingsInput) {
  return settingsSchema.parse({
    ...input.settings,
    establishmentName:
      input.establishmentName ?? input.settings.establishmentName,
    currencyCode: input.currencyCode ?? input.settings.currencyCode,
    locale: input.locale ?? input.settings.locale,
    logoImageUrl:
      input.logoImageUrl === undefined
        ? input.settings.logoImageUrl
        : input.logoImageUrl,
    showClosedOrders: input.showClosedOrders ?? input.settings.showClosedOrders,
    shareSensitiveData:
      input.shareSensitiveData ?? input.settings.shareSensitiveData,
    printIntegrationEnabled:
      input.printIntegrationEnabled ?? input.settings.printIntegrationEnabled,
    diagnosticsEnabled:
      input.diagnosticsEnabled ?? input.settings.diagnosticsEnabled,
    whatsappIntegrationEnabled:
      input.whatsappIntegrationEnabled ?? input.settings.whatsappIntegrationEnabled,
    updatedAt: nowIsoString()
  })
}
