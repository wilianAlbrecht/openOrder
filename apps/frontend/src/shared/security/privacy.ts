import type { Order, Settings } from '@/entities'

export type ExternalIntegration = 'whatsapp' | 'printing'

const integrationFlags: Record<
  ExternalIntegration,
  keyof Pick<Settings, 'whatsappIntegrationEnabled' | 'printIntegrationEnabled'>
> = {
  whatsapp: 'whatsappIntegrationEnabled',
  printing: 'printIntegrationEnabled'
}

export function isIntegrationEnabled(
  settings: Settings,
  integration: ExternalIntegration
) {
  return settings[integrationFlags[integration]]
}

export function buildPrivacySafeOrderSummary(order: Order, settings: Settings) {
  const baseSummary = {
    number: order.number,
    status: order.status,
    totalInCents: order.totalInCents,
    items: order.items.map((item) => ({
      productName: item.productName,
      quantity: item.quantity
    }))
  }

  if (!settings.shareSensitiveData) {
    return baseSummary
  }

  return {
    ...baseSummary,
    notes: order.notes,
    items: order.items.map((item) => ({
      productName: item.productName,
      quantity: item.quantity,
      notes: item.notes
    }))
  }
}
