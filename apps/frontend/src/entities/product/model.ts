import { z } from 'zod'
import { createEntityId } from '@/shared/lib/id'
import { nowIsoString } from '@/shared/lib/time'
import {
  safeOptionalTextField,
  safeTextField
} from '@/shared/security/schema'

const dataImageUrlSchema = z
  .string()
  .trim()
  .startsWith('data:image/', 'Imagem local invalida')

export const productSchema = z.object({
  id: z.string().min(1),
  name: safeTextField(120),
  category: safeTextField(60),
  priceInCents: z.int().nonnegative(),
  description: safeOptionalTextField(500),
  imageUrl: z.union([z.string().trim().url(), dataImageUrlSchema]).optional(),
  available: z.boolean(),
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime()
})

export type Product = z.infer<typeof productSchema>

export type CreateProductInput = {
  name: string
  category: string
  priceInCents: number
  description?: string
  imageUrl?: string
  available?: boolean
}

export function createProduct(input: CreateProductInput): Product {
  const timestamp = nowIsoString()

  return productSchema.parse({
    id: createEntityId('product'),
    name: input.name,
    category: input.category,
    priceInCents: input.priceInCents,
    description: input.description,
    imageUrl: input.imageUrl,
    available: input.available ?? true,
    createdAt: timestamp,
    updatedAt: timestamp
  })
}

export type UpdateProductInput = Partial<CreateProductInput> & {
  product: Product
}

export function updateProduct(input: UpdateProductInput): Product {
  return productSchema.parse({
    ...input.product,
    name: input.name ?? input.product.name,
    category: input.category ?? input.product.category,
    priceInCents: input.priceInCents ?? input.product.priceInCents,
    description:
      input.description === undefined ? input.product.description : input.description,
    imageUrl: input.imageUrl === undefined ? input.product.imageUrl : input.imageUrl,
    available: input.available ?? input.product.available,
    updatedAt: nowIsoString()
  })
}
