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

// Desactivar el cambio de valor por scroll en los input[type="number"]
document.addEventListener('wheel', (e) => {
  if (e.target.type === 'number') {
    e.preventDefault();
  }
}, { passive: false });

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
        <ThemeProvider>
          <AuthProvider>
            <YearProvider>
              <App />
            </YearProvider>
          </AuthProvider>
        </ThemeProvider>
      </BrowserRouter>
      {/* Devtools de React Query (solo visible en desarrollo) */}
      <ReactQueryDevtools initialIsOpen={false} position="bottom-left" />
    </QueryClientProvider>
  </StrictMode>,
)
