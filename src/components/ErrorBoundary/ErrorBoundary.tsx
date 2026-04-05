import { useTranslation } from 'react-i18next'
import {
  ErrorBoundaryClass,
  type ErrorBoundaryTranslations,
} from './ErrorBoundaryClass'
import type { ReactNode } from 'react'

export interface ErrorBoundaryProps {
  children: ReactNode
  fallback?: ReactNode
}

export function ErrorBoundary({ children, fallback }: ErrorBoundaryProps) {
  const { t, i18n } = useTranslation()

  // Provide default translations if i18n is not initialized (for tests)
  const translations: ErrorBoundaryTranslations = i18n.isInitialized
    ? {
        title: t('error.title'),
        componentStack: t('error.componentStack'),
        stackTrace: t('error.stackTrace'),
        tryAgain: t('error.tryAgain'),
      }
    : {
        title: 'Something went wrong',
        componentStack: 'Component Stack',
        stackTrace: 'Stack Trace',
        tryAgain: 'Try again',
      }

  return (
    <ErrorBoundaryClass translations={translations} fallback={fallback}>
      {children}
    </ErrorBoundaryClass>
  )
}

export { ErrorBoundaryClass }
export type { ErrorBoundaryTranslations } from './ErrorBoundaryClass'
