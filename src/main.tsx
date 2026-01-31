import { StrictMode, Component, type ReactNode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App'

// Helper to send error to parent Vue component via postMessage
function notifyParentError(error: { type: string; message: string; file?: string; stack?: string }) {
  try {
    // Send to parent window (Vue WebPreview component)
    window.parent.postMessage({
      type: 'PREVIEW_ERROR',
      payload: error
    }, '*')
  } catch (e) {
    console.warn('Could not notify parent of error:', e)
  }
}

// Global error handler to catch module loading errors
window.onerror = (message, source, lineno, colno, error) => {
  console.error('Global error:', message, source, lineno, colno, error)
  
  // Extract file from source URL
  let file: string | undefined
  if (source) {
    const match = source.match(/\/src\/([^?]+)/)
    if (match) file = `src/${match[1]}`
  }
  
  // Notify parent Vue component
  notifyParentError({
    type: 'global',
    message: String(message),
    file,
    stack: error?.stack
  })
  
  const root = document.getElementById('root')
  if (root && !root.hasChildNodes()) {
    root.innerHTML = `
      <div style="padding: 2rem; font-family: system-ui, sans-serif;">
        <h1 style="color: #dc2626; font-size: 1.5rem; margin-bottom: 1rem;">
          ❌ JavaScript Error
        </h1>
        <pre style="background: #fef2f2; padding: 1rem; border-radius: 0.5rem; overflow: auto; font-size: 0.875rem; color: #991b1b; white-space: pre-wrap;">${message}

Source: ${source}
Line: ${lineno}, Column: ${colno}</pre>
      </div>
    `
  }
  return false
}

// Error Boundary to catch React errors and display them
interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
}

class ErrorBoundary extends Component<{ children: ReactNode }, ErrorBoundaryState> {
  constructor(props: { children: ReactNode }) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('React Error:', error, errorInfo)
    
    // Extract file from component stack
    let file: string | undefined
    if (errorInfo.componentStack) {
      const match = errorInfo.componentStack.match(/\/src\/([^?:\s]+)/)
      if (match) file = `src/${match[1]}`
    }
    
    // Notify parent Vue component
    notifyParentError({
      type: 'react',
      message: error.message,
      file,
      stack: error.stack
    })
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '2rem', fontFamily: 'system-ui, sans-serif' }}>
          <h1 style={{ color: '#dc2626', fontSize: '1.5rem', marginBottom: '1rem' }}>
            ❌ React Error
          </h1>
          <pre style={{ 
            background: '#fef2f2', 
            padding: '1rem', 
            borderRadius: '0.5rem',
            overflow: 'auto',
            fontSize: '0.875rem',
            color: '#991b1b',
            whiteSpace: 'pre-wrap'
          }}>
            {this.state.error?.message}
            {'\n\n'}
            {this.state.error?.stack}
          </pre>
        </div>
      )
    }
    return this.props.children
  }
}

// Render the app with ErrorBoundary for catching React errors
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
)

