import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    // Use jsdom to simulate browser
    environment: 'jsdom',

    // Setup file runs before tests
    setupFiles: ['./src/setupTests.js'],

    // Global test utilities
    globals: true,

    // Coverage settings
    coverage: {
      provider: 'v8',
      reportsDirectory: './coverage',
      reporter: ['text', 'lcov', 'html'],
      all: true,
      exclude: [
        'node_modules/',
        'src/setupTests.js',
      ]
    }
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    }
  }
});