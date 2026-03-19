import type { ComponentType } from 'react'

declare const __DEV__: boolean

interface WDYROptions {
  include?: RegExp[]
  exclude?: RegExp[]
  trackHooks?: boolean
  trackAllPureComponents?: boolean
}

let whyDidYouRenderInitialized = false

export async function initWhyDidYouRender(
  options: WDYROptions = {}
): Promise<void> {
  if (!__DEV__ || whyDidYouRenderInitialized) {
    return
  }

  try {
    const whyDidYouRender =
      await import('@welldone-software/why-did-you-render')
    const React = await import('react')

    whyDidYouRender.default(React, {
      include: options.include || [/.*/],
      exclude: options.exclude || [
        /^BrowserRouter/,
        /^Link/,
        /^Route/,
        /^WDYR/,
      ],
      trackHooks: options.trackHooks ?? true,
      trackAllPureComponents: options.trackAllPureComponents ?? true,
      logOnDifferentValues: true,
    })

    whyDidYouRenderInitialized = true
    console.log('[WDYR] Why Did You Render initialized')
  } catch (error) {
    console.warn('[WDYR] Failed to initialize Why Did You Render:', error)
  }
}

export function trackComponent<
  T extends ComponentType<Record<string, unknown>>,
>(Component: T, name?: string): T {
  if (__DEV__) {
    const displayName = name || Component.displayName || Component.name
    if (displayName) {
      ;(Component as unknown as Record<string, unknown>).whyDidYouRender = true
      Component.displayName = displayName
    }
  }
  return Component
}
