import {
  createQueueItemFromOrder,
  createDefaultSettings,
  createOrder,
  createProduct,
  orderSchema,
  productSchema,
  queueItemSchema,
  settingsSchema,
  type Order,
  type Product,
  type QueueItem,
  type Settings
} from '@/entities'
import { IndexedDbStorageAdapter } from '@/shared/storage/indexeddb-storage-adapter'
import { ensureStorageReady } from '@/shared/storage/migration'
import type { AppMetadata } from '@/shared/storage/metadata'
import type {
  OrderRepository,
  ProductRepository,
  QueueRepository,
  SettingsRepository,
  StorageAdapter
} from '@/shared/storage/contracts'

class BrowserProductRepository implements ProductRepository {
  private readonly storage: StorageAdapter

  constructor(storage: StorageAdapter) {
    this.storage = storage
  }

  async list() {
    const products = (await this.storage.get<Product[]>('products')) ?? []
    return products.map((product) => productSchema.parse(product))
  }

  async save(product: Product) {
    const validatedProduct = productSchema.parse(product)
    const products = await this.list()
    const nextProducts = [
      ...products.filter((current) => current.id !== validatedProduct.id),
      validatedProduct
    ]

    await this.storage.set('products', nextProducts)
  }

  async remove(productId: string) {
    const products = await this.list()
    const nextProducts = products.filter((product) => product.id !== productId)

    await this.storage.set('products', nextProducts)
  }
}

class BrowserOrderRepository implements OrderRepository {
  private readonly storage: StorageAdapter

  constructor(storage: StorageAdapter) {
    this.storage = storage
  }

  async list() {
    const orders = (await this.storage.get<Order[]>('orders')) ?? []
    return orders.map((order) => orderSchema.parse(order))
  }

  async getNextNumber() {
    const orders = await this.list()
    const highestNumber = orders.reduce(
      (highest, order) => Math.max(highest, order.number),
      0
    )

    return highestNumber + 1
  }

  async save(order: Order) {
    const validatedOrder = orderSchema.parse(order)
    const orders = await this.list()
    const nextOrders = [
      ...orders.filter((current) => current.id !== validatedOrder.id),
      validatedOrder
    ]

    await this.storage.set('orders', nextOrders)
  }

  async remove(orderId: string) {
    const orders = await this.list()
    const nextOrders = orders.filter((order) => order.id !== orderId)

    await this.storage.set('orders', nextOrders)
  }
}

class BrowserSettingsRepository implements SettingsRepository {
  private readonly storage: StorageAdapter

  constructor(storage: StorageAdapter) {
    this.storage = storage
  }

  async get() {
    const settings = await this.storage.get<Settings>('settings')
    return settings ? settingsSchema.parse(settings) : null
  }

  async save(settings: Settings) {
    await this.storage.set('settings', settingsSchema.parse(settings))
  }
}

class BrowserQueueRepository implements QueueRepository {
  private readonly storage: StorageAdapter

  constructor(storage: StorageAdapter) {
    this.storage = storage
  }

  async listActive() {
    const queue = (await this.storage.get<QueueItem[]>('queue')) ?? []
    return queue.map((item) => queueItemSchema.parse(item))
  }

  async save(item: QueueItem) {
    const validatedItem = queueItemSchema.parse(item)
    const queue = (await this.storage.get<QueueItem[]>('queue')) ?? []
    const nextQueue = [
      ...queue.filter((current) => current.orderId !== validatedItem.orderId),
      validatedItem
    ]

    await this.storage.set('queue', nextQueue)
  }
}

export type ApplicationSnapshot = {
  metadata: AppMetadata
  products: Product[]
  orders: Order[]
  queue: QueueItem[]
  settings: Settings
}

export type ApplicationContext = {
  storage: StorageAdapter
  products: ProductRepository
  orders: OrderRepository
  queue: QueueRepository
  settings: SettingsRepository
}

export function deriveActiveQueue(orders: Order[]) {
  return orders
    .map((order) => createQueueItemFromOrder(order))
    .filter((item): item is QueueItem => item !== null)
}

export function createApplicationContext(): ApplicationContext {
  const storage = new IndexedDbStorageAdapter()

  return {
    storage,
    products: new BrowserProductRepository(storage),
    orders: new BrowserOrderRepository(storage),
    queue: new BrowserQueueRepository(storage),
    settings: new BrowserSettingsRepository(storage)
  }
}

export async function loadApplicationSnapshot(
  context: ApplicationContext
): Promise<ApplicationSnapshot> {
  const metadata = await ensureStorageReady(context.storage)
  const [products, orders, savedSettings] = await Promise.all([
    context.products.list(),
    context.orders.list(),
    context.settings.get()
  ])
  const queue = deriveActiveQueue(orders)
  await context.storage.set('queue', queue)

  const settings = savedSettings ?? createDefaultSettings()

  if (!savedSettings) {
    await context.settings.save(settings)
  }

  return {
    metadata,
    products,
    orders,
    queue,
    settings
  }
}

export function createArchitecturePreview() {
  const product = createProduct({
    name: 'Cafe coado',
    category: 'Bebidas',
    priceInCents: 700,
    description: 'Dose individual para operacao local'
  })

  const order = createOrder({
    number: 1,
    items: [
      {
        id: 'item_preview',
        productId: product.id,
        productName: product.name,
        unitPriceInCents: product.priceInCents,
        quantity: 2
      }
    ],
    notes: 'Sem dados pessoais no exemplo'
  })

  const queue = createQueueItemFromOrder(order) as QueueItem

  return {
    sampleProduct: product,
    sampleOrder: order,
    sampleQueueItem: queue,
    defaultSettings: createDefaultSettings()
  }
}
