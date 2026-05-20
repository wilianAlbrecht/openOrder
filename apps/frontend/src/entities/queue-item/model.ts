import type { Order } from '@/entities/order/model'
import { z } from 'zod'
import { orderStatusSchema } from '@/entities/order/model'

export const queueItemSchema = z.object({
  orderId: z.string().min(1),
  orderNumber: z.int().positive(),
  status: orderStatusSchema.exclude(['entregue', 'finalizada']),
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime()
})

export type QueueItem = z.infer<typeof queueItemSchema>

export function createQueueItemFromOrder(order: Order): QueueItem | null {
  if (order.status === 'entregue' || order.status === 'finalizada') {
    return null
  }

  return queueItemSchema.parse({
    orderId: order.id,
    orderNumber: order.number,
    status: order.status,
    createdAt: order.createdAt,
    updatedAt: order.updatedAt
  })
}
