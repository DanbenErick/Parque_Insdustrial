import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
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

// Crear un cliente de Query con configuraciones por defecto
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false, // Evita re-fetch si el usuario cambia de pestaña
      retry: 1, // Reintenta 1 vez si falla la petición
      staleTime: 5 * 60 * 1000, // 5 minutos antes de considerar la data "vieja"
    },
  },
})

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
