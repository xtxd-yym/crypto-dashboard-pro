import { defineConfig, mergeConfig } from 'vitest/config';
import viteConfig from './vite.config';

export default mergeConfig(viteConfig, defineConfig({
  test: {
    globals: true, // Allows using describe, it, expect without imports
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
    css: false, // Disable CSS processing for faster tests
  },
}));