import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// En desarrollo local (npm run dev), Vite proxea /api hacia el backend.
// En el contenedor, nginx hace este mismo trabajo (ver nginx.conf).
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': 'http://localhost:8080'
    }
  }
})
