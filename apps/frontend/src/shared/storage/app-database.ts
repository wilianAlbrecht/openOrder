import Dexie, { type Table } from 'dexie'
import type { Order, Product, QueueItem, Settings } from '@/entities'
import type { AppMetadata } from '@/shared/storage/metadata'

type SettingsRecord = Settings & { id: 'default' }

export class OpenOrderDatabase extends Dexie {
  products!: Table<Product, string>
  orders!: Table<Order, string>
  queue!: Table<QueueItem, string>
  settings!: Table<SettingsRecord, string>
  metadata!: Table<AppMetadata, string>

  constructor() {
    super('openorder-db')

    this.version(1).stores({
      products: 'id, category, available, updatedAt',
      orders: 'id, number, status, updatedAt',
      queue: 'orderId, status, updatedAt',
      settings: 'id, updatedAt',
      metadata: 'key, updatedAt'
    })
  }
}

export const openOrderDb = new OpenOrderDatabase()
