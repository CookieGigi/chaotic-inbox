import { useState, useCallback, useEffect, useRef } from 'react'
import { useAppStore } from '@/store/appStore'
import { db } from '@/storage/local_db'
import {
  generateItems,
  generateTextItem,
  generateFileItem,
} from '@/test/performance/data-generators'
import {
  measureOperation,
  measureMemory,
  measureFPS,
} from '@/test/performance/measure'
import {
  PlayIcon,
  TrashIcon,
  ChartBarIcon,
  ClockIcon,
  MemoryIcon,
} from '@phosphor-icons/react'

interface TestResult {
  name: string
  duration: number
  memoryDelta?: number
  itemCount?: number
  fps?: number
  timestamp: Date
}

export function StressTest() {
  const [itemCount, setItemCount] = useState(1000)
  const [textSizeKB, setTextSizeKB] = useState(10)
  const [fileSizeMB, setFileSizeMB] = useState(5)
  const [isRunning, setIsRunning] = useState(false)
  const [results, setResults] = useState<TestResult[]>([])
  const [currentMemory, setCurrentMemory] = useState(0)
  const [browserInfo, setBrowserInfo] = useState('')

  const resultsEndRef = useRef<HTMLDivElement>(null)

  const loadItems = useAppStore((state) => state.loadItems)
  const addItems = useAppStore((state) => state.addItems)
  const reset = useAppStore((state) => state.reset)
  const items = useAppStore((state) => state.items)
  const itemStoreCount = items.length

  // Detect browser on mount
  useEffect(() => {
    const ua = navigator.userAgent
    let browser = 'Unknown'
    if (ua.includes('Firefox')) browser = 'Firefox'
    else if (ua.includes('Chrome')) browser = 'Chrome'
    else if (ua.includes('Safari')) browser = 'Safari'
    else if (ua.includes('Edge')) browser = 'Edge'
    setBrowserInfo(`${browser} - ${navigator.platform}`)
  }, [])

  // Update memory periodically
  useEffect(() => {
    const interval = setInterval(() => {
      const mem = measureMemory()
      setCurrentMemory(mem.usedMB)
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  // Scroll to latest result
  // biome-ignore lint/correctness/useExhaustiveDependencies: only need to scroll when results count changes
  useEffect(() => {
    resultsEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [results.length])

  const addResult = useCallback((result: TestResult) => {
    setResults((prev) => [...prev, result])
  }, [])

  const clearResults = useCallback(() => {
    setResults([])
  }, [])

  const clearDatabase = useCallback(async () => {
    await db.items.clear()
    reset()
    setResults([])
    addResult({
      name: 'Database cleared',
      duration: 0,
      timestamp: new Date(),
    })
  }, [reset, addResult])

  const runTest = useCallback(
    async (testName: string, testFn: () => Promise<void>) => {
      setIsRunning(true)
      const memoryBefore = measureMemory().usedMB

      try {
        const { metrics } = await measureOperation(testFn, testName)
        const memoryAfter = measureMemory().usedMB

        // Get current item count from store (not stale closure)
        const currentItemCount = useAppStore.getState().items.length

        addResult({
          name: testName,
          duration: metrics.duration,
          memoryDelta: Math.round((memoryAfter - memoryBefore) * 100) / 100,
          itemCount: currentItemCount,
          timestamp: new Date(),
        })
      } catch (error) {
        addResult({
          name: `${testName} (FAILED)`,
          duration: 0,
          timestamp: new Date(),
        })
        console.error(error)
      } finally {
        setIsRunning(false)
      }
    },
    [addResult]
  )

  const testGenerateItems = useCallback(async () => {
    await runTest(`Generate ${itemCount} items`, async () => {
      const newItems = generateItems(itemCount)
      await addItems(newItems)
    })
  }, [itemCount, addItems, runTest])

  const testGenerateLargeText = useCallback(async () => {
    await runTest(`Add text item (${textSizeKB}KB)`, async () => {
      const item = generateTextItem(textSizeKB)
      await addItems([item])
    })
  }, [textSizeKB, addItems, runTest])

  const testGenerateLargeFile = useCallback(async () => {
    await runTest(`Add file (${fileSizeMB}MB)`, async () => {
      const item = generateFileItem(fileSizeMB)
      await addItems([item])
    })
  }, [fileSizeMB, addItems, runTest])

  const testLoadAllItems = useCallback(async () => {
    await runTest('Load all items from database', async () => {
      reset()
      await loadItems()
    })
  }, [reset, loadItems, runTest])

  const testFPS = useCallback(async () => {
    setIsRunning(true)
    const fps = await measureFPS(async () => {
      // Simulate some work
      for (let i = 0; i < 100; i++) {
        await new Promise((resolve) => setTimeout(resolve, 10))
      }
    }, 2000)

    addResult({
      name: 'FPS Test (2s)',
      duration: 2000,
      fps,
      timestamp: new Date(),
    })
    setIsRunning(false)
  }, [addResult])

  const testRenderStress = useCallback(async () => {
    await runTest('Render stress (generate 5000 items)', async () => {
      const newItems = generateItems(5000)
      await addItems(newItems)
    })
  }, [addItems, runTest])

  return (
    <div className="min-h-screen bg-bg text-text p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <header className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Performance Stress Test</h1>
          <p className="text-text/60 mb-4">
            Development-only page for testing application performance under load
          </p>
          <div className="flex gap-4 text-sm">
            <span className="px-3 py-1 bg-surface rounded-full">
              Browser: {browserInfo}
            </span>
            <span className="px-3 py-1 bg-surface rounded-full">
              Current Memory: {currentMemory}MB
            </span>
            <span className="px-3 py-1 bg-surface rounded-full">
              Items in Store: {itemStoreCount}
            </span>
          </div>
        </header>

        {/* Configuration Panel */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-surface p-6 rounded-lg">
            <label
              htmlFor="itemCount"
              className="block text-sm font-medium mb-2"
            >
              Item Count: {itemCount}
            </label>
            <input
              id="itemCount"
              type="range"
              min="100"
              max="10000"
              step="100"
              value={itemCount}
              onChange={(e) => setItemCount(Number(e.target.value))}
              className="w-full accent-accent"
            />
            <div className="flex justify-between text-xs text-text/50 mt-1">
              <span>100</span>
              <span>10,000</span>
            </div>
          </div>

          <div className="bg-surface p-6 rounded-lg">
            <label
              htmlFor="textSizeKB"
              className="block text-sm font-medium mb-2"
            >
              Text Size: {textSizeKB}KB
            </label>
            <input
              id="textSizeKB"
              type="range"
              min="1"
              max="500"
              step="10"
              value={textSizeKB}
              onChange={(e) => setTextSizeKB(Number(e.target.value))}
              className="w-full accent-accent"
            />
            <div className="flex justify-between text-xs text-text/50 mt-1">
              <span>1KB</span>
              <span>500KB</span>
            </div>
          </div>

          <div className="bg-surface p-6 rounded-lg">
            <label
              htmlFor="fileSizeMB"
              className="block text-sm font-medium mb-2"
            >
              File Size: {fileSizeMB}MB
            </label>
            <input
              id="fileSizeMB"
              type="range"
              min="1"
              max="30"
              step="1"
              value={fileSizeMB}
              onChange={(e) => setFileSizeMB(Number(e.target.value))}
              className="w-full accent-accent"
            />
            <div className="flex justify-between text-xs text-text/50 mt-1">
              <span>1MB</span>
              <span>30MB</span>
            </div>
          </div>
        </div>

        {/* Test Actions */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <button
            type="button"
            onClick={testGenerateItems}
            disabled={isRunning}
            className="flex items-center justify-center gap-2 bg-accent text-bg px-6 py-4 rounded-lg font-medium hover:bg-accent/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <PlayIcon size={20} weight="fill" />
            Generate {itemCount} Items
          </button>

          <button
            type="button"
            onClick={testGenerateLargeText}
            disabled={isRunning}
            className="flex items-center justify-center gap-2 bg-accent text-bg px-6 py-4 rounded-lg font-medium hover:bg-accent/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <PlayIcon size={20} weight="fill" />
            Add {textSizeKB}KB Text
          </button>

          <button
            type="button"
            onClick={testGenerateLargeFile}
            disabled={isRunning}
            className="flex items-center justify-center gap-2 bg-accent text-bg px-6 py-4 rounded-lg font-medium hover:bg-accent/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <PlayIcon size={20} weight="fill" />
            Add {fileSizeMB}MB File
          </button>

          <button
            type="button"
            onClick={testLoadAllItems}
            disabled={isRunning}
            className="flex items-center justify-center gap-2 bg-accent text-bg px-6 py-4 rounded-lg font-medium hover:bg-accent/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <PlayIcon size={20} weight="fill" />
            Load from Database
          </button>

          <button
            type="button"
            onClick={testFPS}
            disabled={isRunning}
            className="flex items-center justify-center gap-2 bg-surface text-text px-6 py-4 rounded-lg font-medium hover:bg-surface/80 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <ChartBarIcon size={20} />
            Test FPS
          </button>

          <button
            type="button"
            onClick={testRenderStress}
            disabled={isRunning}
            className="flex items-center justify-center gap-2 bg-surface text-text px-6 py-4 rounded-lg font-medium hover:bg-surface/80 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <ClockIcon size={20} />
            Render Stress (5K)
          </button>

          <button
            type="button"
            onClick={clearDatabase}
            disabled={isRunning}
            className="flex items-center justify-center gap-2 bg-red-600 text-white px-6 py-4 rounded-lg font-medium hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <TrashIcon size={20} weight="fill" />
            Clear Database
          </button>

          <button
            type="button"
            onClick={clearResults}
            disabled={isRunning}
            className="flex items-center justify-center gap-2 bg-surface text-text px-6 py-4 rounded-lg font-medium hover:bg-surface/80 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <TrashIcon size={20} />
            Clear Results
          </button>
        </div>

        {/* Results Panel */}
        <div className="bg-surface rounded-lg overflow-hidden">
          <div className="px-6 py-4 bg-surface/50 border-b border-border flex items-center justify-between">
            <h2 className="text-xl font-semibold">Test Results</h2>
            <span className="text-sm text-text/50">
              {results.length} test{results.length !== 1 ? 's' : ''} run
            </span>
          </div>

          <div className="divide-y divide-border max-h-[500px] overflow-y-auto">
            {results.length === 0 ? (
              <div className="px-6 py-12 text-center text-text/50">
                <MemoryIcon size={48} className="mx-auto mb-4 opacity-50" />
                <p>No tests run yet. Click a button above to start testing.</p>
              </div>
            ) : (
              results.map((result) => (
                <div
                  key={`${result.name}-${result.timestamp.getTime()}`}
                  className={`px-6 py-4 ${result.name.includes('FAILED') ? 'bg-red-50' : ''}`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">{result.name}</span>
                    <span className="text-sm text-text/50">
                      {result.timestamp.toLocaleTimeString()}
                    </span>
                  </div>
                  <div className="flex gap-6 text-sm">
                    <span className="text-accent">
                      Duration: {result.duration.toFixed(2)}ms
                    </span>
                    {result.memoryDelta !== undefined && (
                      <span
                        className={
                          result.memoryDelta > 0
                            ? 'text-warning'
                            : 'text-success'
                        }
                      >
                        Memory: {result.memoryDelta > 0 ? '+' : ''}
                        {result.memoryDelta}MB
                      </span>
                    )}
                    {result.itemCount !== undefined && (
                      <span className="text-text/60">
                        Items: {result.itemCount}
                      </span>
                    )}
                    {result.fps !== undefined && (
                      <span
                        className={
                          result.fps >= 30 ? 'text-success' : 'text-warning'
                        }
                      >
                        FPS: {result.fps}
                      </span>
                    )}
                  </div>
                </div>
              ))
            )}
            <div ref={resultsEndRef} />
          </div>
        </div>

        {/* Tips */}
        <div className="mt-8 p-6 bg-surface/50 rounded-lg">
          <h3 className="font-semibold mb-2">Testing Tips</h3>
          <ul className="list-disc list-inside text-sm text-text/70 space-y-1">
            <li>Start with smaller counts and work your way up</li>
            <li>Use browser DevTools Performance tab for detailed profiling</li>
            <li>Watch for memory leaks in the Memory tab</li>
            <li>Test both Firefox and Chrome for browser differences</li>
            <li>Clear database between major test runs for clean results</li>
            <li>FPS should stay above 30 for smooth UI</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
