import type { StorageKey } from '@/shared/storage/contracts'

export const storageKeys: Record<StorageKey, string> = {
  products: 'openorder.products',
  orders: 'openorder.orders',
  settings: 'openorder.settings',
  queue: 'openorder.queue',
  'app-metadata': 'openorder.app-metadata'
}
