import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { queryClient } from './api/queryClient'
import { AuthProvider } from './context/AuthContext'
import { ThemeProvider } from './context/ThemeContext'
import { YearProvider } from './context/YearContext'
import './index.css'
import App from './App.jsx'
import AppErrorBoundary from './components/ui/AppErrorBoundary.jsx'
import { NavigationFeedbackProvider } from './context/NavigationFeedbackContext.jsx'

// Evitar cambios accidentales en inputs numéricos sin bloquear el scroll global.
document.addEventListener('wheel', (e) => {
  const target = e.target;
  if (target instanceof HTMLInputElement && target.type === 'number' && document.activeElement === target) {
    target.blur();
  }
}, { passive: true });

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <NavigationFeedbackProvider>
          <ThemeProvider>
            <AuthProvider>
              <YearProvider>
                <AppErrorBoundary>
                  <App />
                </AppErrorBoundary>
              </YearProvider>
            </AuthProvider>
          </ThemeProvider>
        </NavigationFeedbackProvider>
      </BrowserRouter>
      {/* Devtools de React Query (solo en desarrollo) */}
      {import.meta.env.DEV && (
        <ReactQueryDevtools initialIsOpen={false} position="bottom-left" />
      )}
    </QueryClientProvider>
  </StrictMode>,
)
