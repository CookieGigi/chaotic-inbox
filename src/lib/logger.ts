import type { ConsolaInstance } from 'consola'
import { createConsola } from 'consola/browser'

declare const __LOG_LEVEL__: number
declare const __APP_ENV__: string
declare const __DEV__: boolean

export const logger: ConsolaInstance = createConsola({
  level: __LOG_LEVEL__,
  defaults: {
    tag: __APP_ENV__,
  },
})

type DebugNamespace = string

class DebugLogger {
  private enabledNamespaces: Set<string> = new Set()
  private allEnabled: boolean = false

  constructor() {
    if (__DEV__ && typeof window !== 'undefined') {
      const debugEnv = (window as unknown as Record<string, string>).DEBUG || ''
      if (debugEnv === '*' || debugEnv === 'true') {
        this.allEnabled = true
      } else if (debugEnv) {
        debugEnv
          .split(',')
          .forEach((ns) => this.enabledNamespaces.add(ns.trim()))
      }
    }
  }

  private isEnabled(namespace: DebugNamespace): boolean {
    if (!__DEV__) return false
    if (this.allEnabled) return true
    return this.enabledNamespaces.has(namespace)
  }

  log(namespace: DebugNamespace, ...args: unknown[]): void {
    if (this.isEnabled(namespace)) {
      logger.info(`[${namespace}]`, ...args)
    }
  }

  warn(namespace: DebugNamespace, ...args: unknown[]): void {
    if (this.isEnabled(namespace)) {
      logger.warn(`[${namespace}]`, ...args)
    }
  }

  error(namespace: DebugNamespace, ...args: unknown[]): void {
    if (this.isEnabled(namespace)) {
      logger.error(`[${namespace}]`, ...args)
    }
  }

  group(namespace: DebugNamespace, label: string): void {
    if (this.isEnabled(namespace)) {
      console.group(`[${namespace}] ${label}`)
    }
  }

  groupEnd(namespace: DebugNamespace): void {
    if (this.isEnabled(namespace)) {
      console.groupEnd()
    }
  }

  time(namespace: DebugNamespace, label: string): void {
    if (this.isEnabled(namespace)) {
      console.time(`[${namespace}] ${label}`)
    }
  }

  timeEnd(namespace: DebugNamespace, label: string): void {
    if (this.isEnabled(namespace)) {
      console.timeEnd(`[${namespace}] ${label}`)
    }
  }
}

export const debug = new DebugLogger()

export function createDebug(namespace: DebugNamespace) {
  return {
    log: (...args: unknown[]) => debug.log(namespace, ...args),
    warn: (...args: unknown[]) => debug.warn(namespace, ...args),
    error: (...args: unknown[]) => debug.error(namespace, ...args),
    group: (label: string) => debug.group(namespace, label),
    groupEnd: () => debug.groupEnd(namespace),
    time: (label: string) => debug.time(namespace, label),
    timeEnd: (label: string) => debug.timeEnd(namespace, label),
  }
}

export type { DebugNamespace }
