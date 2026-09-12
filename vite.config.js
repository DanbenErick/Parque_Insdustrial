import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'logo.png'],
      manifest: {
        name: 'Sistema Luz Jicamarca',
        short_name: 'Luz Jicamarca',
        description: 'Gestión de cobros y lecturas del Parque Industrial Jicamarca',
        theme_color: '#515B3A',
        background_color: '#ffffff',
        display: 'standalone',
        icons: [
          {
            src: '/logo.png', // Fallback
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: '/logo.png', // Fallback
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      }
    })
  ],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('react-dom') || id.includes('react-router-dom')) {
              return 'vendor-react';
            }
            if (id.includes('chart.js') || id.includes('react-chartjs-2')) {
              return 'vendor-charts';
            }
            if (id.includes('exceljs') || id.includes('xlsx')) {
              return 'vendor-excel';
            }
            if (id.includes('sonner') || id.includes('lucide-react')) {
              return 'vendor-ui';
            }
          }
        }
      }
    },
    // Alerta si un chunk supera 800KB
    chunkSizeWarningLimit: 800,
  }
})

