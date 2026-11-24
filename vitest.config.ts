import { defineConfig } from 'vitest/config';

const ALL = { lines: 100, branches: 100, functions: 100, statements: 100 };

export default defineConfig({
  test: {
    environment: 'jsdom',
    include: ['src/**/*.spec.{ts,tsx}'],
    setupFiles: ['./src/test/setup.ts'],
    // `npm run test:coverage`. The UI and the main process's Electron
    // wiring are covered by the e2e suite, not here, so the global floor is
    // low; the pure modules with unit tests are held per file.
    coverage: {
      provider: 'v8',
      include: ['src/**/*.{ts,tsx}'],
      exclude: ['src/**/*.spec.{ts,tsx}', 'src/**/*.d.ts', 'src/test/**'],
      reporter: ['text-summary', 'text'],
      thresholds: {
        lines: 9,
        branches: 13,
        functions: 7,
        statements: 9,
        // Security-relevant main-process helpers and the shared media URL
        // codec: every line and branch
        'src/main/{lastFolder,navigation,paths,pendingSave,permissions,range}.ts':
          { ...ALL, perFile: true },
        'src/shared/**/*.ts': { ...ALL, perFile: true },
        'src/renderer/services/{file,text,time,models/Video,stores/videosPersistence}.ts':
          {
            lines: 70,
            branches: 75,
            functions: 75,
            statements: 70,
            perFile: true,
          },
      },
    },
  },
});
