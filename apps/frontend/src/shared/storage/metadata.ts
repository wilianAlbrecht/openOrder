import { z } from 'zod'

export const CURRENT_STORAGE_SCHEMA_VERSION = 1

export const appMetadataSchema = z.object({
  key: z.literal('app-metadata'),
  schemaVersion: z.number().int().nonnegative(),
  storageEngine: z.literal('indexeddb'),
  migratedFromLocalStorageAt: z.iso.datetime().optional(),
  updatedAt: z.iso.datetime()
})

export type AppMetadata = z.infer<typeof appMetadataSchema>
