/// <reference types="vitest" />
/// <reference types="vite/client" />

import { defineConfig } from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';
import { resolve } from 'path';

export default defineConfig({
  plugins: [tsconfigPaths({ root: '../remix-app' })],
  test: {
    include: ['./functions/**/*.{test,spec}.{js,mjs,cjs,ts}'],
    watchExclude: ['.*\\/node_modules\\/.*', '.*\\/build\\/.*'],
  },
  resolve: {
    alias: [{ find: '@remix-app', replacement: resolve(__dirname, '..', 'remix-app') }],
  },
});
