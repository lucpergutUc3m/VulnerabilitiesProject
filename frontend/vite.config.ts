import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import removeConsole from 'vite-plugin-remove-console'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react({
      babel: {
        plugins: [['babel-plugin-react-compiler']],
      },
    }),
    removeConsole(), // Elimina console.* en producción
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@env': path.resolve(__dirname, './envConfig'),
    },
  },
  build: {
    minify: 'esbuild', // Usar esbuild en lugar de terser para evitar problemas
    sourcemap: false,
  },
  server: {
    // Configurar headers de seguridad en desarrollo
    headers: {
      'X-Frame-Options': 'DENY',
      'X-Content-Type-Options': 'nosniff',
      'X-XSS-Protection': '1; mode=block',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      'Permissions-Policy': 'geolocation=(), microphone=(), camera=()',
    }
  },
  preview: {
    // Headers de seguridad también en preview
    headers: {
      'X-Frame-Options': 'DENY',
      'X-Content-Type-Options': 'nosniff',
      'X-XSS-Protection': '1; mode=block',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      'Permissions-Policy': 'geolocation=(), microphone=(), camera=()',
    }
  }
})
