import { z } from 'zod'
import { createEntityId } from '@/shared/lib/id'
import { nowIsoString } from '@/shared/lib/time'
import {
  safeOptionalSensitiveTextField,
  safeTextField
} from '@/shared/security/schema'

export const orderStatusSchema = z.enum([
  'aberta',
  'preparando',
  'pronta',
  'entregue',
  'finalizada'
])

export const orderItemSchema = z.object({
  id: z.string().min(1),
  productId: z.string().min(1),
  productName: safeTextField(120),
  unitPriceInCents: z.int().nonnegative(),
  quantity: z.int().positive(),
  notes: safeOptionalSensitiveTextField(280)
})

export const orderSchema = z.object({
  id: z.string().min(1),
  number: z.int().positive(),
  status: orderStatusSchema,
  items: z.array(orderItemSchema),
  totalInCents: z.int().nonnegative(),
  notes: safeOptionalSensitiveTextField(500),
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime()
})

export type OrderStatus = z.infer<typeof orderStatusSchema>
export type OrderItem = z.infer<typeof orderItemSchema>
export type Order = z.infer<typeof orderSchema>

export type CreateOrderInput = {
  number: number
  items?: OrderItem[]
  notes?: string
}

export function calculateOrderTotal(items: OrderItem[]) {
  return items.reduce(
    (total, item) => total + item.unitPriceInCents * item.quantity,
    0
  )
}

export function createOrder(input: CreateOrderInput): Order {
  const items = input.items ?? []
  const timestamp = nowIsoString()

  return orderSchema.parse({
    id: createEntityId('order'),
    number: input.number,
    status: 'aberta',
    items,
    totalInCents: calculateOrderTotal(items),
    notes: input.notes,
    createdAt: timestamp,
    updatedAt: timestamp
  })
}

export type UpdateOrderInput = {
  order: Order
  items?: OrderItem[]
  notes?: string
  status?: OrderStatus
}

const orderStatusTransitions: Record<OrderStatus, OrderStatus[]> = {
  aberta: ['preparando'],
  preparando: ['pronta'],
  pronta: ['entregue'],
  entregue: ['finalizada'],
  finalizada: []
}

const previousOrderStatusMap: Partial<Record<OrderStatus, OrderStatus>> = {
  preparando: 'aberta',
  pronta: 'preparando',
  entregue: 'pronta',
  finalizada: 'entregue'
}

export function canTransitionOrderStatus(
  currentStatus: OrderStatus,
  nextStatus: OrderStatus
) {
  return (
    orderStatusTransitions[currentStatus].includes(nextStatus) ||
    previousOrderStatusMap[currentStatus] === nextStatus
  )
}

export function getNextOrderStatuses(status: OrderStatus) {
  return orderStatusTransitions[status]
}

export function getPreviousOrderStatus(status: OrderStatus) {
  return previousOrderStatusMap[status]
}

export function updateOrder(input: UpdateOrderInput): Order {
  const items = input.items ?? input.order.items
  const nextStatus = input.status ?? input.order.status

  if (
    input.status !== undefined &&
    input.status !== input.order.status &&
    !canTransitionOrderStatus(input.order.status, input.status)
  ) {
    throw new Error('Transicao de status invalida para a comanda.')
  }

  return orderSchema.parse({
    ...input.order,
    items,
    status: nextStatus,
    notes: input.notes === undefined ? input.order.notes : input.notes,
    totalInCents: calculateOrderTotal(items),
    updatedAt: nowIsoString()
  })
}
