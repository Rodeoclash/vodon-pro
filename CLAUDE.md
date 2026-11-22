# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project status

Vodon Pro is an Electron + React desktop app for esports coaches to review multiple synchronised gameplay videos (multi-POV playback, per-frame drawing via tldraw, bookmarks, project save/load). It is built on electron-react-boilerplate (ERB), which is incompatible with newer Electron versions, so it is currently pinned to Electron 25 / React 17 / Chakra UI v1 / zustand v3. An upgrade to current Electron and libraries is planned; dependencies that can't be upgraded cleanly (e.g. tldraw) are to be replaced with in-house tooling (reference implementation: `/home/samuel/Sites/vodon_2`).

## Commands

- `mise install` then `lefthook install` — tool versions (Node, Biome, lefthook, gitleaks) are pinned in `mise.toml`. Git hooks: pre-commit runs gitleaks and `biome check --write` on staged files; pre-push runs gitleaks, Biome, typecheck and tests.
- `npm install` — also runs a postinstall that rebuilds native deps (`release/app`) and builds the renderer DLL bundle.
- `npm start` — dev mode. Starts the webpack dev server for the renderer, which in turn spawns `start:preload` and `start:main` (electronmon) — see `.erb/configs/webpack.config.renderer.dev.ts`.
- `npm run build` — production build of main and renderer into `release/app/dist`.
- `npm run package` — build plus electron-builder packaging into `release/build`.
- `npm run lint` — Biome (lint + format check, config in `biome.json`); `npm run format` applies fixes. `.erb/` is excluded as it is slated for replacement.
- `npm run typecheck` — `tsc --noEmit`.
- `npm test` — Vitest (jsdom), specs are `src/**/*.spec.ts(x)`. `npm run test:watch` for watch mode.
- Single test: `npx vitest run src/renderer/services/time.spec.ts` (or `npx vitest run -t "name"`).

CI (`.github/workflows/test.yml`) runs `npm run package && npx tsc && npm test` on macOS, Ubuntu and Windows with Node 18.

## Architecture

Standard ERB layout with two processes:

- **Main process** (`src/main/`): `main.ts` creates the window, enforces single-instance (a second launch forwards its argv to the existing window via `onLoadAdditionalVideos`), registers the `file` scheme as privileged so `<video>` can load local files, and exposes `ipcMain.handle` handlers. Video metadata and thumbnails use `fluent-ffmpeg` with binaries from `ffmpeg-ffprobe-static` (path is rewritten from `app.asar` to `app.asar.unpacked` in production; the package is listed in `asarUnpack` and in `release/app/package.json`). `menu.ts` owns the File menu: new/save/load project dialogs, which message the renderer.
- **Preload** (`src/main/preload.ts`): the only bridge. Exposes `window.app` (version, argv, save project, open browser, and listeners for new/save/load/additional-videos requests from the menu) and `window.video` (`exists`, `screenshot`, `getMetadata`). Adding a new IPC capability means touching `main.ts`, `preload.ts`, and `src/renderer/preload.d.ts` (the `Window` type declarations).
- **Renderer** (`src/renderer/`): React 17 with `HashRouter` (`index.tsx`). Routes: `/` = SetupVideos (aligning videos), `/review` = ReviewVideos, `/settings`, `/about`, `/received_vods`. `pages/App.tsx` is the shell.

### State

All app state lives in zustand stores under `src/renderer/services/stores/`, both using the `persist` middleware (autosave to localStorage):

- `videos.ts` — the core store: videos, active video, global `currentTime`, playing/seeking, playback speed, bookmarks. It holds live `HTMLVideoElement`s (`video.el`) on each video. The custom `serialize` strips `el` and uses superjson; `deserialize` checks each file still exists (via `window.video.exists`), drops missing ones, and recreates `<video>` elements. The same serialize/deserialize pair is used for project file save/load, triggered from main-process menu events registered at the bottom of this file. `CURRENT_PERSIST_VERSION` versions the format.
- `settings.ts` — user preferences.

### Synchronisation model

Each `Video` (`services/models/Video.ts`) has a `syncTime` (the moment in that video that matches the shared moment in all the others). `recalculateOffsets` derives each video's `offset` from the global start and `durationNormalised` (offset + duration); the global timeline length is the max `durationNormalised`. Global `currentTime` is mapped into each video's local time using its offset. Bookmarks (`models/VideoBookmark.ts`) belong to a video and store tldraw drawing content alongside time and coordinates.

Pure helpers with unit tests live in `services/` (`file.ts`, `time.ts`, `text.ts`, `models/Video.ts`).
