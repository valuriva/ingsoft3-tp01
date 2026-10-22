import { defineConfig, configDefaults } from 'vitest/config'
import react from '@vitejs/plugin-react'

// En desarrollo local (npm run dev), Vite proxea /api hacia el backend.
// En el contenedor, nginx hace este mismo trabajo (ver nginx.conf).
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': 'http://localhost:8080'
    }
  },
  test: {
    exclude: [...configDefaults.exclude, 'e2e/**'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov', 'json-summary'],
      include: ['src/lib/**'],
      thresholds: { lines: 80, branches: 80 },
    },
  },
})
