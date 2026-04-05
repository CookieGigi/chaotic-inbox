import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'

import enTranslations from '@/i18n/locales/en/translation.json'

// Initialize i18n for tests with synchronous loading
void i18n.use(initReactI18next).init({
  lng: 'en',
  fallbackLng: 'en',
  debug: false,
  ns: ['translation'],
  defaultNS: 'translation',
  resources: {
    en: {
      translation: enTranslations,
    },
  },
  interpolation: {
    escapeValue: false,
  },
})

export default i18n
