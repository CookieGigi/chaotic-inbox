import { defineConfig } from 'vitest/config'
import path from 'path'
import { fileURLToPath } from 'url'

const currentDir = path.dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(currentDir, './src'),
      '@components': path.resolve(currentDir, './src/components'),
      '@assets': path.resolve(currentDir, './src/assets'),
      '@styles': path.resolve(currentDir, './src/styles'),
      '@test': path.resolve(currentDir, './src/test'),
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
  },
})
