import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['logo-192.png', 'logo-512.png'],
      manifest: {
        name: 'Sistema Luz Jicamarca',
        short_name: 'Luz Jicamarca',
        description: 'Gestión de cobros y lecturas del Parque Industrial Jicamarca',
        lang: 'es',
        theme_color: '#515B3A',
        background_color: '#ffffff',
        display: 'standalone',
        icons: [
          {
            src: '/logo-192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: '/logo-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      },
      workbox: {
        // Los motores de Excel se descargan únicamente cuando el usuario abre
        // una función de importación/exportación; no forman parte del arranque offline.
        globIgnores: ['**/vendor-exceljs-*.js']
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
            if (id.includes('exceljs')) {
              return 'vendor-exceljs';
            }
            if (id.includes('sonner')) {
              return 'vendor-ui';
            }
          }
        }
      }
    },
    // ExcelJS incluye el motor completo de hojas de cálculo (~930 KB minificado).
    // Conservamos la alerta para cualquier chunk que supere ese tamaño conocido.
    chunkSizeWarningLimit: 1000,
  }
})

