import type { Preview } from '@storybook/react-vite'
import { themes } from 'storybook/theming'
import '@/styles/index.css'

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },

    a11y: {
      // 'todo' - show a11y violations in the test UI only
      // 'error' - fail CI on a11y violations
      // 'off' - skip a11y checks entirely
      test: 'todo',
    },

    // Story canvas background - dark mode matching design system
    backgrounds: {
      default: 'dark',
      values: [
        {
          name: 'dark',
          value: '#181926', // --color-bg from design system
        },
        {
          name: 'surface',
          value: '#1e2030', // --color-surface
        },
      ],
    },

    // Docs dark theme
    docs: {
      theme: themes.dark,
    },
  },
}

export default preview
