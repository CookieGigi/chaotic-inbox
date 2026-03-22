import { Dexie, type EntityTable } from 'dexie'
import type { RawItem } from '@/models/rawItem'

export class VaultDB extends Dexie {
  items!: EntityTable<RawItem, 'id'>

  constructor() {
    super('vault')
    this.version(1).stores({
      items: 'id, capturedAt, type',
    })
  }
}

export const db = new VaultDB()
