import type { ConsolaInstance } from 'consola'
import { createConsola } from 'consola/browser'

declare const __LOG_LEVEL__: number
declare const __APP_ENV__: string

export const logger: ConsolaInstance = createConsola({
  level: __LOG_LEVEL__,
  defaults: {
    tag: __APP_ENV__,
  },
})
