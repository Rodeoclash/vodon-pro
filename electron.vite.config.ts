import { resolve } from 'node:path';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'electron-vite';

// Main and preload externalise package.json `dependencies` (they ship in the
// app's node_modules); everything else, including all renderer libraries in
// devDependencies, is bundled.
export default defineConfig({
  main: {
    build: {
      rolldownOptions: {
        input: { main: resolve(__dirname, 'src/main/main.ts') },
      },
    },
  },
  preload: {
    build: {
      rolldownOptions: {
        input: { preload: resolve(__dirname, 'src/main/preload.ts') },
      },
    },
  },
  renderer: {
    plugins: [react()],
  },
});
