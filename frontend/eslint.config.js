import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist']),

  {
    files: ['**/*.{js,jsx}'],
    extends: [
      js.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
      parserOptions: {
        ecmaVersion: 'latest',
        ecmaFeatures: { jsx: true },
        sourceType: 'module',
      },
    },
    rules: {
      'no-unused-vars': ['error', { varsIgnorePattern: '^[A-Z_]' }],
    },
  },

  {
    files: [
      'src/**/*.{test,spec}.{js,jsx}',
      'src/**/__tests__/**/*.{js,jsx}',
      'src/setupTests.js',
      'src/services/__mocks__/**/*.{js,jsx}',
    ],
    languageOptions: {
      globals: {
        describe: 'readonly',
        it: 'readonly',
        test: 'readonly',
        expect: 'readonly',
        vi: 'readonly',
        beforeEach: 'readonly',
        afterEach: 'readonly',
        beforeAll: 'readonly',
        afterAll: 'readonly',
        global: 'readonly',
      },
    },
    rules: {
      'no-unused-vars': 'off',
      'react-hooks/globals': 'off',
    },
  },

  {
    files: ['*.config.js', '*.config.*.js'],
    languageOptions: {
      globals: globals.node,
    },
  },
    
  {
    files: [
      'src/components/Dashboard/Dashboard.jsx',
      'src/context/ThemeContext.jsx',
      'src/context/UserContext.jsx',
    ],
    rules: {
      'react-refresh/only-export-components': 'off',
    },
  },

  {
    files: [
      'src/components/Dashboard/Dashboard.jsx',
      'src/context/UserContext.jsx',
      'src/pages/UserProfilePage.jsx',
    ],
    rules: {
      'react-hooks/set-state-in-effect': 'off',
    },
  },

])
