import { vi } from 'vitest'

// Declare global for Node.js GC function
declare const global: typeof globalThis & { gc?: () => void }

export interface PerformanceMetrics {
  duration: number
  memoryBefore?: number
  memoryAfter?: number
  memoryDelta?: number
  fps?: number
}

export interface RenderMetrics {
  renderTime: number
  commitTime: number
  frameCount: number
}

/**
 * Measure the execution time of an async operation
 */
export async function measureOperation<T>(
  operation: () => Promise<T>,
  name: string
): Promise<{ result: T; metrics: PerformanceMetrics }> {
  const memoryBefore = (
    performance as Performance & { memory?: { usedJSHeapSize: number } }
  ).memory?.usedJSHeapSize
  const startTime = performance.now()

  const result = await operation()

  const endTime = performance.now()
  const memoryAfter = (
    performance as Performance & { memory?: { usedJSHeapSize: number } }
  ).memory?.usedJSHeapSize

  const metrics: PerformanceMetrics = {
    duration: endTime - startTime,
    memoryBefore: memoryBefore
      ? Math.round(memoryBefore / 1024 / 1024)
      : undefined,
    memoryAfter: memoryAfter
      ? Math.round(memoryAfter / 1024 / 1024)
      : undefined,
  }

  if (metrics.memoryBefore !== undefined && metrics.memoryAfter !== undefined) {
    metrics.memoryDelta =
      Math.round((metrics.memoryAfter - metrics.memoryBefore) * 100) / 100
  }

  console.log(
    `[Performance] ${name}: ${metrics.duration.toFixed(2)}ms`,
    metrics.memoryDelta !== undefined
      ? `(Memory: ${metrics.memoryDelta}MB)`
      : ''
  )

  return { result, metrics }
}

/**
 * Measure the execution time of a sync operation
 */
export function measureSyncOperation<T>(
  operation: () => T,
  name: string
): { result: T; metrics: PerformanceMetrics } {
  const memoryBefore = (
    performance as Performance & { memory?: { usedJSHeapSize: number } }
  ).memory?.usedJSHeapSize
  const startTime = performance.now()

  const result = operation()

  const endTime = performance.now()
  const memoryAfter = (
    performance as Performance & { memory?: { usedJSHeapSize: number } }
  ).memory?.usedJSHeapSize

  const metrics: PerformanceMetrics = {
    duration: endTime - startTime,
    memoryBefore: memoryBefore
      ? Math.round(memoryBefore / 1024 / 1024)
      : undefined,
    memoryAfter: memoryAfter
      ? Math.round(memoryAfter / 1024 / 1024)
      : undefined,
  }

  if (metrics.memoryBefore !== undefined && metrics.memoryAfter !== undefined) {
    metrics.memoryDelta =
      Math.round((metrics.memoryAfter - metrics.memoryBefore) * 100) / 100
  }

  console.log(
    `[Performance] ${name}: ${metrics.duration.toFixed(2)}ms`,
    metrics.memoryDelta !== undefined
      ? `(Memory: ${metrics.memoryDelta}MB)`
      : ''
  )

  return { result, metrics }
}

/**
 * Measure React component render time
 */
export function measureRenderTime(
  renderFn: () => void,
  name: string
): RenderMetrics {
  const startTime = performance.now()
  let frameCount = 0

  // Count frames during render
  const countFrames = () => {
    frameCount++
    if (performance.now() - startTime < 1000) {
      requestAnimationFrame(countFrames)
    }
  }
  requestAnimationFrame(countFrames)

  renderFn()

  const commitTime = performance.now()

  const metrics: RenderMetrics = {
    renderTime: commitTime - startTime,
    commitTime,
    frameCount,
  }

  console.log(
    `[Performance] Render ${name}: ${metrics.renderTime.toFixed(2)}ms`
  )

  return metrics
}

/**
 * Measure FPS (frames per second) during an operation
 */
export async function measureFPS(
  operation: () => Promise<void> | void,
  durationMs: number = 1000
): Promise<number> {
  return new Promise((resolve) => {
    let frameCount = 0
    const startTime = performance.now()

    const countFrame = () => {
      frameCount++
      const elapsed = performance.now() - startTime

      if (elapsed < durationMs) {
        requestAnimationFrame(countFrame)
      } else {
        const fps = Math.round((frameCount / elapsed) * 1000)
        console.log(`[Performance] FPS: ${fps} (over ${durationMs}ms)`)
        resolve(fps)
      }
    }

    requestAnimationFrame(countFrame)

    // Execute the operation
    Promise.resolve(operation()).catch(console.error)
  })
}

/**
 * Measure memory usage
 */
export function measureMemory(): {
  usedMB: number
  totalMB: number | undefined
} {
  const memory = (
    performance as Performance & {
      memory?: { usedJSHeapSize: number; totalJSHeapSize: number }
    }
  ).memory

  if (!memory) {
    // Memory API not available in all browsers (e.g., Firefox)
    // Silently return zeros to avoid console noise
    return { usedMB: 0, totalMB: undefined }
  }

  const usedMB = Math.round(memory.usedJSHeapSize / 1024 / 1024)
  const totalMB = memory.totalJSHeapSize
    ? Math.round(memory.totalJSHeapSize / 1024 / 1024)
    : undefined

  console.log(
    `[Performance] Memory: ${usedMB}MB used${totalMB ? ` / ${totalMB}MB total` : ''}`
  )

  return { usedMB, totalMB }
}

/**
 * Measure Time to Interactive (TTI) approximation
 */
export async function measureTimeToInteractive(): Promise<number> {
  return new Promise((resolve) => {
    const startTime = performance.now()
    let lastLongTask = startTime

    // Check for long tasks (blocking operations)
    const checkTTI = () => {
      const now = performance.now()

      // If no long tasks for 50ms, consider interactive
      if (now - lastLongTask > 50) {
        const tti = now - startTime
        console.log(`[Performance] TTI: ${tti.toFixed(2)}ms`)
        resolve(tti)
        return
      }

      // Simulate work to detect blocking
      const frameStart = performance.now()
      requestAnimationFrame(() => {
        const frameDuration = performance.now() - frameStart
        if (frameDuration > 50) {
          lastLongTask = performance.now()
        }
        checkTTI()
      })
    }

    checkTTI()
  })
}

/**
 * Create performance marks for detailed tracing
 */
export function markPerformance(label: string): void {
  if (typeof performance !== 'undefined' && performance.mark) {
    performance.mark(label)
    console.log(`[Performance] Mark: ${label}`)
  }
}

/**
 * Measure between two performance marks
 */
export function measureBetweenMarks(
  startMark: string,
  endMark: string
): number | null {
  if (typeof performance === 'undefined' || !performance.measure) {
    return null
  }

  try {
    performance.measure(`${startMark}_to_${endMark}`, startMark, endMark)
    const entries = performance.getEntriesByName(`${startMark}_to_${endMark}`)
    const duration = entries[entries.length - 1]?.duration

    if (duration !== undefined) {
      console.log(
        `[Performance] ${startMark} → ${endMark}: ${duration.toFixed(2)}ms`
      )
      return duration
    }
  } catch {
    console.warn(
      `[Performance] Could not measure between ${startMark} and ${endMark}`
    )
  }

  return null
}

/**
 * Clear all performance marks and measures
 */
export function clearPerformanceMarks(): void {
  if (typeof performance !== 'undefined') {
    performance.clearMarks()
    performance.clearMeasures()
  }
}

/**
 * Run a stress test with multiple iterations
 */
export async function runStressTest<T>(
  testFn: (iteration: number) => Promise<T>,
  iterations: number,
  name: string
): Promise<{
  results: T[]
  avgDuration: number
  minDuration: number
  maxDuration: number
}> {
  console.log(
    `[Performance] Starting stress test: ${name} (${iterations} iterations)`
  )

  const results: T[] = []
  const durations: number[] = []

  for (let i = 0; i < iterations; i++) {
    const { result, metrics } = await measureOperation(
      () => testFn(i),
      `${name} - iteration ${i + 1}`
    )
    results.push(result)
    durations.push(metrics.duration)
  }

  const avgDuration = durations.reduce((a, b) => a + b, 0) / durations.length
  const minDuration = Math.min(...durations)
  const maxDuration = Math.max(...durations)

  console.log(`[Performance] Stress test ${name} complete:`)
  console.log(`  - Average: ${avgDuration.toFixed(2)}ms`)
  console.log(`  - Min: ${minDuration.toFixed(2)}ms`)
  console.log(`  - Max: ${maxDuration.toFixed(2)}ms`)

  return { results, avgDuration, minDuration, maxDuration }
}

/**
 * Detect memory leaks by measuring memory before and after operations
 */
export async function detectMemoryLeak(
  operation: () => Promise<void>,
  iterations: number = 10,
  thresholdMB: number = 10
): Promise<{ hasLeak: boolean; memoryGrowthMB: number }> {
  const memoryReadings: number[] = []

  // Force garbage collection if available (Node.js/V8)
  if (typeof global !== 'undefined' && (global as { gc?: () => void }).gc) {
    ;(global as { gc: () => void }).gc()
  }

  // Initial measurement
  const initialMemory = measureMemory().usedMB
  memoryReadings.push(initialMemory)

  // Run operation multiple times
  for (let i = 0; i < iterations; i++) {
    await operation()

    // Force GC if available
    if (typeof global !== 'undefined' && (global as { gc?: () => void }).gc) {
      ;(global as { gc: () => void }).gc()
    }

    const memory = measureMemory().usedMB
    memoryReadings.push(memory)
  }

  const memoryGrowthMB =
    memoryReadings[memoryReadings.length - 1] - memoryReadings[0]
  const hasLeak = memoryGrowthMB > thresholdMB

  console.log(
    `[Performance] Memory leak detection: ${hasLeak ? 'LEAK DETECTED' : 'No leak detected'}`
  )
  console.log(
    `  - Growth: ${memoryGrowthMB.toFixed(2)}MB over ${iterations} iterations`
  )

  return { hasLeak, memoryGrowthMB }
}

/**
 * Mock performance API for tests
 */
export function mockPerformanceAPI(): void {
  if (typeof performance === 'undefined') {
    // @ts-expect-error - mocking performance for test environment
    global.performance = {
      now: vi.fn(() => Date.now()),
      mark: vi.fn(),
      measure: vi.fn(),
      getEntriesByName: vi.fn(() => []),
      clearMarks: vi.fn(),
      clearMeasures: vi.fn(),
    }
  }

  if (typeof requestAnimationFrame === 'undefined') {
    global.requestAnimationFrame = vi.fn((cb: FrameRequestCallback) => {
      return setTimeout(() => cb(Date.now()), 16) as unknown as number
    })
  }

  if (typeof cancelAnimationFrame === 'undefined') {
    global.cancelAnimationFrame = vi.fn((id: number) => {
      clearTimeout(id)
    })
  }
}
