import react from '@vitejs/plugin-react'
import { defineConfig } from 'vitest/config'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // Relative base so the built app works on GitHub Pages under any
  // repository path (https://<user>.github.io/<repo>/) without changes.
  base: './',
  build: {
    outDir: 'dist',
  },
  test: {
    include: ['tests/**/*.test.ts', 'tests/**/*.test.tsx'],
    environment: 'node',
  },
})
