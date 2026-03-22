import 'fake-indexeddb/auto'
import { VaultDB } from './local_db'
import type { RawItem } from '@/models/rawItem'
import {
  createTextItem,
  createUrlItem,
  createImageItem,
  createFileItem,
} from '@/models/itemFactories'
import type {
  TextMetadata,
  UrlMetadata,
  ImageMetadata,
  FileMetadata,
} from '@/models/metadata'

let testDb: VaultDB

export function setupTestDB(): VaultDB {
  testDb = new VaultDB()
  return testDb
}

export async function teardownTestDB(): Promise<void> {
  if (testDb) {
    await (testDb as unknown as { delete(): Promise<void> }).delete()
    testDb = null as unknown as VaultDB
  }
}

export async function resetDatabase(): Promise<void> {
  if (testDb) {
    await testDb.items.clear()
  }
}

export function createTestTextItem(
  overrides?: Partial<RawItem>
): RawItem & { type: 'text' } {
  const metadata: TextMetadata = { kind: 'plain', wordCount: 5 }
  const item = createTextItem('Test content for unit tests', metadata)
  return { ...item, ...overrides } as RawItem & { type: 'text' }
}

export function createTestUrlItem(
  overrides?: Partial<RawItem>
): RawItem & { type: 'url' } {
  const metadata: UrlMetadata = { kind: 'url', title: 'Test Page' }
  const item = createUrlItem('https://example.com/test', metadata)
  return { ...item, ...overrides } as RawItem & { type: 'url' }
}

export function createTestImageItem(
  overrides?: Partial<RawItem>
): RawItem & { type: 'image' } {
  const blob = new Blob(['test image data'], { type: 'image/png' })
  const metadata: ImageMetadata = { kind: 'image', width: 1920, height: 1080 }
  const item = createImageItem(blob, metadata)
  return { ...item, ...overrides } as RawItem & { type: 'image' }
}

export function createTestFileItem(
  overrides?: Partial<RawItem>
): RawItem & { type: 'file' } {
  const blob = new Blob(['test file content'], { type: 'text/plain' })
  const metadata: FileMetadata = {
    kind: 'txt',
    filename: 'test.txt',
    filesize: 100,
    mimetype: 'text/plain',
  }
  const item = createFileItem(blob, metadata)
  return { ...item, ...overrides } as RawItem & { type: 'file' }
}

export function generateTestBlob(sizeInBytes: number): Blob {
  const content = new Uint8Array(sizeInBytes)
  for (let i = 0; i < sizeInBytes; i++) {
    content[i] = i % 256
  }
  return new Blob([content])
}

export async function blobToArrayBuffer(blob: Blob): Promise<ArrayBuffer> {
  return await blob.arrayBuffer()
}

export async function arraysEqual(
  a: ArrayBuffer,
  b: ArrayBuffer
): Promise<boolean> {
  if (a.byteLength !== b.byteLength) return false
  const viewA = new Uint8Array(a)
  const viewB = new Uint8Array(b)
  for (let i = 0; i < viewA.length; i++) {
    if (viewA[i] !== viewB[i]) return false
  }
  return true
}

export function generateTestItems(
  count: number
): Array<RawItem & { type: 'text' }> {
  const items: Array<RawItem & { type: 'text' }> = []
  for (let i = 0; i < count; i++) {
    const metadata: TextMetadata = { kind: 'plain', wordCount: 1 }
    items.push(createTextItem(`Test item ${i}`, metadata))
  }
  return items
}
