import type { Order, Product, QueueItem, Settings } from '@/entities'
import type { StorageAdapter, StorageKey } from '@/shared/storage/contracts'
import { openOrderDb } from '@/shared/storage/app-database'
import type { AppMetadata } from '@/shared/storage/metadata'

export class IndexedDbStorageAdapter implements StorageAdapter {
  async get<T>(key: StorageKey) {
    switch (key) {
      case 'products':
        return (await openOrderDb.products.toArray()) as T
      case 'orders':
        return (await openOrderDb.orders.toArray()) as T
      case 'queue':
        return (await openOrderDb.queue.toArray()) as T
      case 'settings': {
        const settings = await openOrderDb.settings.get('default')
        return (settings ? omitSettingsId(settings) : null) as T | null
      }
      case 'app-metadata':
        return ((await openOrderDb.metadata.get('app-metadata')) ?? null) as T | null
    }
  }

  async set<T>(key: StorageKey, value: T) {
    switch (key) {
      case 'products':
        await replaceProducts(toProductArray(value))
        return
      case 'orders':
        await replaceOrders(toOrderArray(value))
        return
      case 'queue':
        await replaceQueue(toQueueArray(value))
        return
      case 'settings':
        await openOrderDb.settings.put({
          ...(value as Settings),
          id: 'default'
        })
        return
      case 'app-metadata':
        await openOrderDb.metadata.put(value as AppMetadata)
    }
  }

  async remove(key: StorageKey) {
    switch (key) {
      case 'products':
        await openOrderDb.products.clear()
        return
      case 'orders':
        await openOrderDb.orders.clear()
        return
      case 'queue':
        await openOrderDb.queue.clear()
        return
      case 'settings':
        await openOrderDb.settings.delete('default')
        return
      case 'app-metadata':
        await openOrderDb.metadata.delete('app-metadata')
    }
  }
}

function toProductArray(value: unknown) {
  return Array.isArray(value) ? (value as Product[]) : []
}

function toOrderArray(value: unknown) {
  return Array.isArray(value) ? (value as Order[]) : []
}

function toQueueArray(value: unknown) {
  return Array.isArray(value) ? (value as QueueItem[]) : []
}

function omitSettingsId(value: Settings & { id: string }) {
  return Object.fromEntries(
    Object.entries(value).filter(([key]) => key !== 'id')
  ) as Settings
}

async function replaceProducts(products: Product[]) {
  await openOrderDb.transaction('rw', openOrderDb.products, async () => {
    await openOrderDb.products.clear()

    if (products.length > 0) {
      await openOrderDb.products.bulkPut(products)
    }
  })
}

async function replaceOrders(orders: Order[]) {
  await openOrderDb.transaction('rw', openOrderDb.orders, async () => {
    await openOrderDb.orders.clear()

    if (orders.length > 0) {
      await openOrderDb.orders.bulkPut(orders)
    }
  })
}

async function replaceQueue(queue: QueueItem[]) {
  await openOrderDb.transaction('rw', openOrderDb.queue, async () => {
    await openOrderDb.queue.clear()

    if (queue.length > 0) {
      await openOrderDb.queue.bulkPut(queue)
    }
  })
}
