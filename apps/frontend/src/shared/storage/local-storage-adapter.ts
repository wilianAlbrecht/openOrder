import type { StorageAdapter, StorageKey } from '@/shared/storage/contracts'
import { storageKeys } from '@/shared/storage/keys'

export class BrowserLocalStorageAdapter implements StorageAdapter {
  async get<T>(key: StorageKey) {
    const rawValue = window.localStorage.getItem(storageKeys[key])

    if (!rawValue) {
      return null
    }

    return JSON.parse(rawValue) as T
  }

  async set<T>(key: StorageKey, value: T) {
    window.localStorage.setItem(storageKeys[key], JSON.stringify(value))
  }

  async remove(key: StorageKey) {
    window.localStorage.removeItem(storageKeys[key])
  }
}
