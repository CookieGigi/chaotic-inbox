import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles/index.css'
import './i18n/config'
import App from './App.tsx'
import { ErrorBoundary } from './components/ErrorBoundary'
import { initWhyDidYouRender } from './lib'

// Initialize Why Did You Render in development
initWhyDidYouRender()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>
)
