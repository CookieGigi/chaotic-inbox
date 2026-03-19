import { useState, memo } from 'react'
import { trackComponent } from '@/lib'
import { createDebug } from '@/lib'

const debug = createDebug('WDYR-Example')

// This component will trigger WDYR warning because it re-renders
// even when its props haven't changed (because parent state changes)
function UnoptimizedCounter({ label }: { label: string }) {
  console.log('UnoptimizedCounter rendered')
  return <div className="p-2 border rounded">{label}</div>
}

// Mark for WDYR tracking and set display name
UnoptimizedCounter.displayName = 'UnoptimizedCounter'
UnoptimizedCounter.whyDidYouRender = true

// This component is memoized - won't re-render unless props change
const OptimizedCounter = memo(function OptimizedCounter({
  label,
}: {
  label: string
}) {
  console.log('OptimizedCounter rendered')
  return <div className="p-2 border rounded bg-green-100">{label}</div>
})

// Mark for WDYR tracking and set display name
OptimizedCounter.displayName = 'OptimizedCounter'
OptimizedCounter.whyDidYouRender = true

export function WDYRExample() {
  const [count, setCount] = useState(0)
  const [unrelatedState, setUnrelatedState] = useState(0)

  debug.log('WDYRExample rendered', { count, unrelatedState })

  return (
    <div className="p-6 max-w-md mx-auto space-y-4">
      <h2 className="text-xl font-bold">WDYR Example</h2>

      <div className="space-y-2">
        <p className="text-sm text-gray-600">
          Open DevTools console to see WDYR warnings
        </p>

        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 border rounded bg-red-50">
            <h3 className="font-semibold mb-2">Unoptimized</h3>
            <UnoptimizedCounter label="I re-render unnecessarily" />
          </div>

          <div className="p-4 border rounded bg-green-50">
            <h3 className="font-semibold mb-2">Optimized (memo)</h3>
            <OptimizedCounter label="I only render when needed" />
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <p>Count: {count}</p>
        <button
          onClick={() => setCount((c) => c + 1)}
          className="px-4 py-2 bg-blue-600 text-white rounded"
        >
          Increment Count (affects both)
        </button>
      </div>

      <div className="space-y-2">
        <p>Unrelated State: {unrelatedState}</p>
        <button
          onClick={() => setUnrelatedState((s) => s + 1)}
          className="px-4 py-2 bg-orange-600 text-white rounded"
        >
          Change Unrelated State (triggers WDYR warning)
        </button>
      </div>

      <div className="text-sm text-gray-500 mt-4">
        <p className="font-semibold">Expected behavior:</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>
            Clicking "Change Unrelated State" triggers WDYR warning for
            UnoptimizedCounter
          </li>
          <li>OptimizedCounter won't show warning (memo prevents re-render)</li>
        </ul>
      </div>
    </div>
  )
}

// Track this component too
export default trackComponent(WDYRExample, 'WDYRExample')
