import type { Order, Product, QueueItem, Settings } from '@/entities'

export type StorageKey =
  | 'products'
  | 'orders'
  | 'settings'
  | 'queue'
  | 'app-metadata'

export interface StorageAdapter {
  get<T>(key: StorageKey): Promise<T | null>
  set<T>(key: StorageKey, value: T): Promise<void>
  remove(key: StorageKey): Promise<void>
}

export interface ProductRepository {
  list(): Promise<Product[]>
  save(product: Product): Promise<void>
  remove(productId: string): Promise<void>
}

export interface OrderRepository {
  list(): Promise<Order[]>
  getNextNumber(): Promise<number>
  save(order: Order): Promise<void>
  remove(orderId: string): Promise<void>
}

export interface QueueRepository {
  listActive(): Promise<QueueItem[]>
  save(item: QueueItem): Promise<void>
}

export interface SettingsRepository {
  get(): Promise<Settings | null>
  save(settings: Settings): Promise<void>
}
