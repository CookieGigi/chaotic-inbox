/// <reference types="vitest/config" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { storybookTest } from '@storybook/addon-vitest/vitest-plugin'
import { playwright } from '@vitest/browser-playwright'
const currentDir = path.dirname(fileURLToPath(import.meta.url))

// More info at: https://storybook.js.org/docs/next/writing-tests/integrations/vitest-addon
export default defineConfig({
  define: {
    __LOG_LEVEL__: JSON.stringify(
      process.env.NODE_ENV === 'development' ? 5 : 2
    ),
    __APP_ENV__: JSON.stringify(process.env.NODE_ENV),
    __DEV__: JSON.stringify(process.env.NODE_ENV === 'development'),
  },
  plugins: [react(), tailwindcss()],
  build: {
    sourcemap: process.env.SOURCE_MAP === 'true',
  },
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
    coverage: {
      provider: 'v8',
      reporter: ['html', 'text', 'text-summary'],
      reportsDirectory: './coverage',
      include: ['src/**/*'],
      exclude: [
        'src/**/*.stories.{ts,tsx}',
        'src/**/*.d.ts',
        'src/test/**/*',
        'src/main.tsx',
      ],
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 80,
        statements: 80,
      },
    },
    projects: [
      {
        extends: true,
        test: {
          name: 'unit',
        },
      },
      {
        extends: true,
        plugins: [
          // The plugin will run tests for the stories defined in your Storybook config
          // See options at: https://storybook.js.org/docs/next/writing-tests/integrations/vitest-addon#storybooktest
          storybookTest({
            configDir: path.join(currentDir, '.storybook'),
          }),
        ],
        test: {
          name: 'storybook',
          browser: {
            enabled: true,
            headless: true,
            provider: playwright({}),
            instances: [
              {
                browser: 'chromium',
              },
            ],
          },
        },
      },
    ],
  },
})
