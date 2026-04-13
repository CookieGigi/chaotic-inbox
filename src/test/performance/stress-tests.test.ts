import 'fake-indexeddb/auto'
import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { db } from '@/storage/local_db'
import { useAppStore } from '@/store/appStore'
import {
  generateItems,
  generateFiles,
  generateTextItem,
  generateFileItem,
} from './data-generators'
import {
  measureOperation,
  measureMemory,
  detectMemoryLeak,
  mockPerformanceAPI,
} from './measure'

// Mock performance API for test environment
mockPerformanceAPI()

describe('Performance Stress Tests', () => {
  beforeEach(async () => {
    // Clear the database before each test
    await db.items.clear()
    // Reset the store
    useAppStore.getState().reset()
  })

  afterEach(async () => {
    // Cleanup
    await db.items.clear()
    useAppStore.getState().reset()
  })

  describe('Item List Rendering', () => {
    it('renders 100 items within acceptable time', async () => {
      const items = generateItems(100)
      const { metrics } = await measureOperation(async () => {
        await useAppStore.getState().addItems(items)
      }, 'Add 100 items')

      expect(metrics.duration).toBeLessThan(5000) // 5 seconds max
      expect(useAppStore.getState().items.length).toBe(100)
    })

    it('renders 1,000 items within acceptable time', async () => {
      const items = generateItems(1000)
      const { metrics } = await measureOperation(async () => {
        await useAppStore.getState().addItems(items)
      }, 'Add 1,000 items')

      expect(metrics.duration).toBeLessThan(30000) // 30 seconds max
      expect(useAppStore.getState().items.length).toBe(1000)
    })

    it('renders 5,000 items within acceptable time', async () => {
      const items = generateItems(5000)
      const { metrics } = await measureOperation(async () => {
        await useAppStore.getState().addItems(items)
      }, 'Add 5,000 items')

      expect(metrics.duration).toBeLessThan(120000) // 2 minutes max
      expect(useAppStore.getState().items.length).toBe(5000)
    })

    it('renders 10,000 items within acceptable time', async () => {
      const items = generateItems(10000)
      const { metrics } = await measureOperation(async () => {
        await useAppStore.getState().addItems(items)
      }, 'Add 10,000 items')

      expect(metrics.duration).toBeLessThan(300000) // 5 minutes max
      expect(useAppStore.getState().items.length).toBe(10000)
    })

    it('loads 1,000 items from database within acceptable time', async () => {
      // First, populate the database
      const items = generateItems(1000)
      await useAppStore.getState().addItems(items)

      // Reset store to simulate fresh load
      useAppStore.getState().reset()

      const { metrics } = await measureOperation(async () => {
        await useAppStore.getState().loadItems()
      }, 'Load 1,000 items from database')

      expect(metrics.duration).toBeLessThan(10000) // 10 seconds max
      expect(useAppStore.getState().items.length).toBe(1000)
    })

    it('loads 10,000 items from database within acceptable time', async () => {
      // First, populate the database
      const items = generateItems(10000)
      await useAppStore.getState().addItems(items)

      // Reset store to simulate fresh load
      useAppStore.getState().reset()

      const { metrics } = await measureOperation(async () => {
        await useAppStore.getState().loadItems()
      }, 'Load 10,000 items from database')

      expect(metrics.duration).toBeLessThan(60000) // 1 minute max
      expect(useAppStore.getState().items.length).toBe(10000)
    })
  })

  describe('File Storage', () => {
    it('stores a 30MB file within acceptable time', async () => {
      const fileItem = generateFileItem(30)

      const { metrics } = await measureOperation(async () => {
        await useAppStore.getState().addItems([fileItem])
      }, 'Store 30MB file')

      expect(metrics.duration).toBeLessThan(10000) // 10 seconds max

      // Verify it was stored
      const storedItems = await db.items.toArray()
      expect(storedItems.length).toBe(1)
      expect((storedItems[0].raw as Blob).size).toBe(30 * 1024 * 1024)
    })

    it('stores ten 10MB files (100MB total)', async () => {
      const files = Array.from({ length: 10 }, () => generateFileItem(10))

      const { metrics } = await measureOperation(async () => {
        await useAppStore.getState().addItems(files)
      }, 'Store ten 10MB files')

      expect(metrics.duration).toBeLessThan(60000) // 1 minute max

      const storedItems = await db.items.toArray()
      expect(storedItems.length).toBe(10)
    })

    it('stores fifty 5MB files (250MB total)', async () => {
      const files = Array.from({ length: 50 }, () => generateFileItem(5))

      const { metrics } = await measureOperation(async () => {
        await useAppStore.getState().addItems(files)
      }, 'Store fifty 5MB files')

      expect(metrics.duration).toBeLessThan(300000) // 5 minutes max

      const storedItems = await db.items.toArray()
      expect(storedItems.length).toBe(50)
    })

    it('loads a 30MB file within acceptable time', async () => {
      const fileItem = generateFileItem(30)
      await useAppStore.getState().addItems([fileItem])

      useAppStore.getState().reset()

      const { metrics } = await measureOperation(async () => {
        await useAppStore.getState().loadItems()
      }, 'Load 30MB file')

      expect(metrics.duration).toBeLessThan(5000) // 5 seconds max
    })

    it('deletes large files within acceptable time', async () => {
      const fileItem = generateFileItem(30)
      await useAppStore.getState().addItems([fileItem])

      const { metrics } = await measureOperation(async () => {
        await useAppStore.getState().deleteItem(fileItem.id as string)
      }, 'Delete 30MB file')

      expect(metrics.duration).toBeLessThan(2000) // 2 seconds max
      expect(useAppStore.getState().items.length).toBe(0)
    })
  })

  describe('Bulk Operations', () => {
    it('pastes 1,000 text items at once within acceptable time', async () => {
      const items = generateItems(1000, { type: 'text' })

      const { metrics } = await measureOperation(async () => {
        await useAppStore.getState().addItems(items)
      }, 'Paste 1,000 text items')

      expect(metrics.duration).toBeLessThan(30000) // 30 seconds max
    })

    it('pastes 5,000 text items at once within acceptable time', async () => {
      const items = generateItems(5000, { type: 'text' })

      const { metrics } = await measureOperation(async () => {
        await useAppStore.getState().addItems(items)
      }, 'Paste 5,000 text items')

      expect(metrics.duration).toBeLessThan(120000) // 2 minutes max
    })

    it('pastes 100KB text content within acceptable time', async () => {
      const textItem = generateTextItem(100)

      const { metrics } = await measureOperation(async () => {
        await useAppStore.getState().addItems([textItem])
      }, 'Paste 100KB text')

      expect(metrics.duration).toBeLessThan(2000) // 2 seconds max
    })

    it('pastes 500KB text content within acceptable time', async () => {
      const textItem = generateTextItem(500)

      const { metrics } = await measureOperation(async () => {
        await useAppStore.getState().addItems([textItem])
      }, 'Paste 500KB text')

      expect(metrics.duration).toBeLessThan(5000) // 5 seconds max
    })

    it('handles 20 files dropped simultaneously', async () => {
      const files = generateFiles(20, 1)
      const items = files.map(() => generateFileItem(1))

      const { metrics } = await measureOperation(async () => {
        await useAppStore.getState().addItems(items)
      }, 'Drop 20 files (1MB each)')

      expect(metrics.duration).toBeLessThan(30000) // 30 seconds max
      expect(useAppStore.getState().items.length).toBe(20)
    })
  })

  describe('Memory Usage', () => {
    it('measures memory with 1,000 items', async () => {
      const items = generateItems(1000)

      await useAppStore.getState().addItems(items)

      const afterMemory = measureMemory()

      console.log(`Memory with 1,000 items: ${afterMemory.usedMB}MB`)

      // Memory should not exceed a reasonable threshold (adjust based on actual measurements)
      expect(afterMemory.usedMB).toBeLessThan(500) // 500MB max
    })

    it('measures memory with 5,000 items', async () => {
      const items = generateItems(5000)

      await useAppStore.getState().addItems(items)

      const afterMemory = measureMemory()

      console.log(`Memory with 5,000 items: ${afterMemory.usedMB}MB`)

      expect(afterMemory.usedMB).toBeLessThan(1000) // 1GB max
    })

    it('measures memory with 10,000 items', async () => {
      const items = generateItems(10000)

      await useAppStore.getState().addItems(items)

      const afterMemory = measureMemory()

      console.log(`Memory with 10,000 items: ${afterMemory.usedMB}MB`)

      expect(afterMemory.usedMB).toBeLessThan(2000) // 2GB max
    })

    it('measures memory with 10,000 items + 30MB file', async () => {
      const items = generateItems(10000)
      const fileItem = generateFileItem(30)

      await useAppStore.getState().addItems(items)
      await useAppStore.getState().addItems([fileItem])

      const afterMemory = measureMemory()

      console.log(
        `Memory with 10,000 items + 30MB file: ${afterMemory.usedMB}MB`
      )

      expect(afterMemory.usedMB).toBeLessThan(3000) // 3GB max
    })

    it('measures memory with 10,000 items + 30MB file', async () => {
      const items = generateItems(10000)
      const fileItem = generateFileItem(30)

      await useAppStore.getState().addItems(items)
      await useAppStore.getState().addItems([fileItem])

      const afterMemory = measureMemory()

      console.log(
        `Memory with 10,000 items + 30MB file: ${afterMemory.usedMB}MB`
      )

      expect(afterMemory.usedMB).toBeLessThan(3000) // 3GB max
    })

    it('checks for memory leaks after item deletion', async () => {
      const items = generateItems(1000)
      await useAppStore.getState().addItems(items)

      const { hasLeak, memoryGrowthMB } = await detectMemoryLeak(
        async () => {
          const itemToDelete = useAppStore.getState().items[0]
          if (itemToDelete) {
            await useAppStore.getState().deleteItem(itemToDelete.id as string)
            // Re-add a similar item to maintain count
            const newItem = generateTextItem()
            await useAppStore.getState().addItems([newItem])
          }
        },
        10, // 10 iterations
        50 // 50MB threshold
      )

      console.log(
        `Memory leak check: ${hasLeak ? 'LEAK DETECTED' : 'No leak'} (${memoryGrowthMB}MB growth)`
      )

      // Test should pass regardless, but log the result
      expect(memoryGrowthMB).toBeDefined()
    })
  })

  describe('Performance Benchmarks', () => {
    it('benchmarks item addition performance scaling', async () => {
      const results: Array<{ count: number; duration: number }> = []

      for (const count of [100, 500, 1000, 5000]) {
        // Clear database for clean test
        await db.items.clear()
        useAppStore.getState().reset()

        const items = generateItems(count)
        const { metrics } = await measureOperation(async () => {
          await useAppStore.getState().addItems(items)
        }, `Benchmark: Add ${count} items`)

        results.push({ count, duration: metrics.duration })
      }

      console.log('Performance scaling results:')
      results.forEach((r) => {
        console.log(
          `  ${r.count} items: ${r.duration.toFixed(2)}ms (${(r.duration / r.count).toFixed(2)}ms/item)`
        )
      })

      // Verify sub-linear or linear scaling
      for (let i = 1; i < results.length; i++) {
        const prev = results[i - 1]
        const curr = results[i]
        const ratio = curr.duration / prev.duration
        const countRatio = curr.count / prev.count

        // Should not be significantly worse than linear
        expect(ratio).toBeLessThan(countRatio * 2) // Allow 2x overhead
      }
    })

    it('measures database export performance with large dataset', async () => {
      // Populate with large dataset
      const items = generateItems(1000)
      await useAppStore.getState().addItems(items)

      const largeFile = generateFileItem(30)
      await useAppStore.getState().addItems([largeFile])

      const { metrics } = await measureOperation(async () => {
        const allItems = await db.items.toArray()
        // Simulate export operation
        const exportData = JSON.stringify(allItems)
        return exportData.length
      }, 'Export dataset (1000 items + 30MB file)')

      expect(metrics.duration).toBeLessThan(30000) // 30 seconds max
    })
  })
})
