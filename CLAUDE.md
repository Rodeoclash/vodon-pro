# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project status

Vodon Pro is an Electron + React desktop app for esports coaches to review multiple synchronised gameplay videos (multi-POV playback, per-frame drawing via tldraw, bookmarks, project save/load). It builds with electron-vite (Vite 8) and packages with electron-builder, on Electron 45. The renderer is still on React 17 / Chakra UI v1 / zustand v3, and TypeScript stays on 4.9 because Chakra v1 blocks 5.x. A library upgrade is planned; dependencies that can't be upgraded cleanly (e.g. tldraw) are to be replaced with in-house tooling (reference implementation: `/home/samuel/Sites/vodon_2`).

## Commands

- `mise install` then `lefthook install` — tool versions (Node, Biome, lefthook, gitleaks) are pinned in `mise.toml`. Git hooks: pre-commit runs gitleaks and `biome check --write` on staged files; pre-push runs gitleaks, Biome, typecheck and tests.
- `npm install` — its postinstall runs Electron's `install-electron` (since Electron 42 the binary isn't downloaded at install otherwise, and electron-vite needs it). Dependency install scripts must be listed, version-pinned, in `allowScripts` in package.json (`npm install-scripts approve <pkg>`); re-approve when bumping ffmpeg-ffprobe-static or electron-winstaller.
- `npm start` — `electron-vite dev --watch`: Vite dev server with HMR for the renderer; main and preload rebuild and Electron restarts when they change.
- `npm run build` — `electron-vite build` into `out/{main,preload,renderer}`. Config: `electron.vite.config.ts`.
- `npm run package` — build plus electron-builder packaging into `release/build`; `npm run publish` does the same and uploads a GitHub release (used by `release.yml` on `v*` tags).
- `npm run lint` — Biome (lint + format check, config in `biome.json`); `npm run format` applies fixes.
- `npm run typecheck` — `tsc --noEmit`. The builds don't use tsc (Vite transpiles), and `electron.vite.config.ts` is excluded from it because TS 4.9's `node` resolution can't read Vite 8's exports-only types; revisit with TS 5 and `moduleResolution: "bundler"`.
- `npm test` — Vitest (jsdom), specs are `src/**/*.spec.ts(x)`. `npm run test:watch` for watch mode.
- Single test: `npx vitest run src/renderer/services/time.spec.ts` (or `npx vitest run -t "name"`).

CI (`.github/workflows/test.yml`): one Ubuntu job runs gitleaks, `biome ci`, typecheck and tests; a matrix job runs `npm run package` on macOS, Ubuntu and Windows. Tool versions come from `mise.toml` via `jdx/mise-action`; actions are pinned to commit SHAs.

## Architecture

Three electron-vite builds, one package.json:

- **Dependencies:** `dependencies` holds only what the main process needs at runtime (electron-log, electron-updater, electron-debug, fluent-ffmpeg, ffmpeg-ffprobe-static). electron-vite leaves these external and electron-builder ships them in the asar's `node_modules`. Everything else, including every renderer library, is a devDependency and gets bundled. Put a new main-process runtime library in `dependencies`; a renderer one goes in `devDependencies`.
- **Main process** (`src/main/main.ts` → `out/main/main.js`, CommonJS): creates the window, enforces single-instance (a second launch forwards its argv to the existing window via `onLoadAdditionalVideos`), registers the `file` scheme as privileged so `<video>` can load local files, exposes `ipcMain.handle` handlers, and in packaged builds checks GitHub Releases for updates (electron-updater). `paths.ts` resolves the renderer (dev server URL from `ELECTRON_RENDERER_URL`, else `out/renderer/index.html`), the preload, and assets (`resources/assets` when packaged). `env.ts` has `isDebug` (`import.meta.env.DEV` or `DEBUG_PROD=true`), which turns on electron-debug, React DevTools and the inspect-element menu. Video metadata and thumbnails use `fluent-ffmpeg` with binaries from `ffmpeg-ffprobe-static`. That package is in `asarUnpack`, and `unpackedBinaryPath` rewrites its path to `app.asar.unpacked`. `menu.ts` owns the File menu: new/open/save project dialogs, which message the renderer and start in the last folder used (`lastFolder.ts`).
- **Preload** (`src/main/preload.ts` → `out/preload/preload.js`): the only bridge. Exposes `window.app` (version, argv, save project, open browser, and listeners for new/save/load/additional-videos requests from the menu) and `window.video` (`exists`, `screenshot`, `getMetadata`, `getPathForFile`, which wraps `webUtils.getPathForFile` since `File.path` is gone). Adding a new IPC capability means touching `main.ts`, `preload.ts`, and `src/renderer/preload.d.ts` (the `Window` type declarations).
- **Renderer** (`src/renderer/`, Vite root, entry `index.html` → `index.tsx`): React 17 with `HashRouter`. Routes: `/` = SetupVideos (aligning videos), `/review` = ReviewVideos, `/settings`, `/about`, `/received_vods`. `pages/App.tsx` is the shell. Asset imports (fonts) are typed via `vite/client` (`src/env.d.ts`).

### State

All app state lives in zustand stores under `src/renderer/services/stores/`, both using the `persist` middleware (autosave to localStorage):

- `videos.ts` — the core store: videos, active video, global `currentTime`, playing/seeking, playback speed, bookmarks. It holds live `HTMLVideoElement`s (`video.el`) on each video. The custom `serialize` strips `el` and uses superjson; `deserialize` checks each file still exists (via `window.video.exists`), drops missing ones, and recreates `<video>` elements. The same serialize/deserialize pair is used for project file save/load, triggered from main-process menu events registered at the bottom of this file. `CURRENT_PERSIST_VERSION` versions the format.
- `settings.ts` — user preferences.

### Synchronisation model

Each `Video` (`services/models/Video.ts`) has a `syncTime` (the moment in that video that matches the shared moment in all the others). `recalculateOffsets` derives each video's `offset` from the global start and `durationNormalised` (offset + duration); the global timeline length is the max `durationNormalised`. Global `currentTime` is mapped into each video's local time using its offset. Bookmarks (`models/VideoBookmark.ts`) belong to a video and store tldraw drawing content alongside time and coordinates.

Pure helpers with unit tests live in `services/` (`file.ts`, `time.ts`, `text.ts`, `models/Video.ts`) and `src/main/` (`paths.ts`, `lastFolder.ts`). Main-process specs start with `// @vitest-environment node`.
