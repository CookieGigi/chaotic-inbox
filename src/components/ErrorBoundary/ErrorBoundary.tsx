import { Component, type ErrorInfo, type ReactNode } from 'react'

declare const __DEV__: boolean

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
  errorInfo: ErrorInfo | null
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null, errorInfo: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo)
    this.setState({ error, errorInfo })
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null })
  }

  render() {
    if (this.state.hasError) {
      if (__DEV__) {
        return (
          <div className="p-6 bg-red-50 border border-red-200 rounded-lg m-4">
            <h2 className="text-xl font-bold text-red-800 mb-4">
              Something went wrong
            </h2>
            <div className="bg-white p-4 rounded border border-red-100 mb-4">
              <p className="font-mono text-sm text-red-600 mb-2">
                {this.state.error?.toString()}
              </p>
              <details className="mt-2">
                <summary className="cursor-pointer text-sm text-gray-600 hover:text-gray-800">
                  Component Stack
                </summary>
                <pre className="mt-2 p-2 bg-gray-100 rounded text-xs overflow-auto max-h-96">
                  {this.state.errorInfo?.componentStack}
                </pre>
              </details>
              <details className="mt-2">
                <summary className="cursor-pointer text-sm text-gray-600 hover:text-gray-800">
                  Stack Trace
                </summary>
                <pre className="mt-2 p-2 bg-gray-100 rounded text-xs overflow-auto max-h-96">
                  {this.state.error?.stack}
                </pre>
              </details>
            </div>
            <button
              onClick={this.handleReset}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
            >
              Try again
            </button>
          </div>
        )
      }

      return (
        this.props.fallback || (
          <div className="p-6 text-center">
            <h2 className="text-xl font-bold text-gray-800 mb-4">
              Something went wrong
            </h2>
            <button
              onClick={this.handleReset}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
            >
              Try again
            </button>
          </div>
        )
      )
    }

    return this.props.children
  }
}
