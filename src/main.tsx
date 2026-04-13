import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles/index.css'
import './i18n/config'
import App from './App.tsx'
import { StressTest } from './pages/StressTest'
import { ErrorBoundary } from './components/ErrorBoundary'
import { ToastContainer } from './components/Toast'
import { initWhyDidYouRender } from './lib'

// Initialize Why Did You Render in development
initWhyDidYouRender()

// Check if we're on the stress test page
const isStressTestPage = window.location.pathname === '/dev/performance'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      {isStressTestPage ? <StressTest /> : <App />}
      <ToastContainer />
    </ErrorBoundary>
  </StrictMode>
)
