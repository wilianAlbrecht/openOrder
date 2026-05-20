import {
  orderSchema,
  productSchema,
  queueItemSchema,
  settingsSchema,
  type Order,
  type Product,
  type QueueItem,
  type Settings
} from '@/entities'
import type { StorageAdapter } from '@/shared/storage/contracts'
import {
  appMetadataSchema,
  CURRENT_STORAGE_SCHEMA_VERSION
} from '@/shared/storage/metadata'

type LegacyPayload = {
  products: Product[]
  orders: Order[]
  queue: QueueItem[]
  settings: Settings | null
}

export async function ensureStorageReady(storage: StorageAdapter) {
  const metadata = await storage.get('app-metadata')

  if (metadata) {
    return appMetadataSchema.parse(metadata)
  }

  const migratedPayload = readLegacyPayload()

  if (migratedPayload.products.length > 0) {
    await storage.set('products', migratedPayload.products)
  }

  if (migratedPayload.orders.length > 0) {
    await storage.set('orders', migratedPayload.orders)
  }

  if (migratedPayload.queue.length > 0) {
    await storage.set('queue', migratedPayload.queue)
  }

  if (migratedPayload.settings) {
    await storage.set('settings', migratedPayload.settings)
  }

  const nextMetadata = appMetadataSchema.parse({
    key: 'app-metadata',
    schemaVersion: CURRENT_STORAGE_SCHEMA_VERSION,
    storageEngine: 'indexeddb',
    migratedFromLocalStorageAt:
      hasLegacyData(migratedPayload) ? new Date().toISOString() : undefined,
    updatedAt: new Date().toISOString()
  })

  await storage.set('app-metadata', nextMetadata)
  clearLegacyStorage()

  return nextMetadata
}

function readLegacyPayload(): LegacyPayload {
  return {
    products: safeParseCollection(
      window.localStorage.getItem('openorder.products'),
      productSchema
    ),
    orders: safeParseCollection(
      window.localStorage.getItem('openorder.orders'),
      orderSchema
    ),
    queue: safeParseCollection(
      window.localStorage.getItem('openorder.queue'),
      queueItemSchema
    ),
    settings: safeParseSingle(
      window.localStorage.getItem('openorder.settings'),
      settingsSchema
    )
  }
}

function safeParseCollection<T>(
  rawValue: string | null,
  schema: { parse: (value: unknown) => T }
) {
  if (!rawValue) {
    return [] as T[]
  }

  try {
    const parsed = JSON.parse(rawValue) as unknown[]
    return parsed.map((value) => schema.parse(value))
  } catch {
    return [] as T[]
  }
}

function safeParseSingle<T>(
  rawValue: string | null,
  schema: { parse: (value: unknown) => T }
) {
  if (!rawValue) {
    return null
  }

  try {
    return schema.parse(JSON.parse(rawValue))
  } catch {
    return null
  }
}

function hasLegacyData(payload: LegacyPayload) {
  return (
    payload.products.length > 0 ||
    payload.orders.length > 0 ||
    payload.queue.length > 0 ||
    payload.settings !== null
  )
}

function clearLegacyStorage() {
  window.localStorage.removeItem('openorder.products')
  window.localStorage.removeItem('openorder.orders')
  window.localStorage.removeItem('openorder.queue')
  window.localStorage.removeItem('openorder.settings')
}
