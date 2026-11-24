import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { expect, test } from '@playwright/test';
import {
  appArgs,
  dismissHelp,
  executable,
  launchApp,
  type RunningApp,
  storedState,
  VIDEOS,
  videoCount,
} from './app';

let running: RunningApp;

test.afterEach(async () => {
  expect(running.errors).toEqual([]);
  await running.app.close();
});

test('File menu saves, clears and reopens a project, starting dialogs in the last folder', async () => {
  const testInfo = test.info();
  running = await launchApp(testInfo.outputPath('profile'), [
    VIDEOS.one,
    VIDEOS.two,
  ]);
  const { app, page } = running;
  await expect.poll(() => videoCount(page)).toBe(2);
  page.on('dialog', (dialog) => dialog.accept()); // "New project" confirms

  // Stub the native dialogs: they always pick projectFile and record the
  // folder they were asked to start in.
  const projectDir = testInfo.outputPath('projects');
  fs.mkdirSync(projectDir, { recursive: true });
  const projectFile = path.join(projectDir, 'scrim.json');
  await app.evaluate(({ dialog }, file) => {
    const calls: Array<[string, string | undefined]> = [];
    Object.assign(globalThis, { dialogCalls: calls });
    dialog.showSaveDialog = (async (
      _window: unknown,
      options: Electron.SaveDialogOptions,
    ) => {
      calls.push(['save', options.defaultPath]);
      return { canceled: false, filePath: file };
    }) as typeof dialog.showSaveDialog;
    dialog.showOpenDialog = (async (
      _window: unknown,
      options: Electron.OpenDialogOptions,
    ) => {
      calls.push(['open', options.defaultPath]);
      return { canceled: false, filePaths: [file] };
    }) as typeof dialog.showOpenDialog;
  }, projectFile);
  const clickMenu = (label: string) =>
    app.evaluate(({ Menu }, itemLabel) => {
      const find = (
        items: Electron.MenuItem[],
      ): Electron.MenuItem | undefined => {
        for (const item of items) {
          if (item.label === itemLabel) return item;
          const inSubmenu = item.submenu && find(item.submenu.items);
          if (inSubmenu) return inSubmenu;
        }
        return undefined;
      };
      const item = find(Menu.getApplicationMenu()?.items ?? []);
      if (!item) throw new Error(`no menu item ${itemLabel}`);
      item.click();
    }, label);

  await clickMenu('Save project as...');
  await expect.poll(() => fs.existsSync(projectFile)).toBe(true);
  const saved = fs.readFileSync(projectFile, 'utf8');
  expect(saved).toContain(JSON.stringify(VIDEOS.one).slice(1, -1));
  expect(saved).toContain(JSON.stringify(VIDEOS.two).slice(1, -1));

  await clickMenu('New project');
  await expect.poll(() => videoCount(page)).toBe(0);

  const openLabel =
    process.platform === 'darwin' ? 'Open project...' : 'Load project...';
  await clickMenu(openLabel);
  await expect.poll(() => videoCount(page)).toBe(2);

  const documents = await app.evaluate(({ app: electronApp }) =>
    electronApp.getPath('documents'),
  );
  expect(
    await app.evaluate(
      () => (globalThis as unknown as { dialogCalls: unknown }).dialogCalls,
    ),
  ).toEqual([
    ['save', documents],
    ['open', projectDir],
  ]);
});

test('a second launch hands its videos to the running app', async () => {
  const testInfo = test.info();
  const profile = testInfo.outputPath('profile');
  running = await launchApp(profile, [VIDEOS.one]);
  const { page } = running;
  await expect.poll(() => videoCount(page)).toBe(1);
  await dismissHelp(page);

  // Same profile, so it hits the single-instance lock and quits
  const second = spawn(executable(), appArgs(profile, [VIDEOS.two]), {
    stdio: 'ignore',
  });
  await new Promise((resolve) => second.on('exit', resolve));

  await expect.poll(() => videoCount(page)).toBe(2);
});

test('autosave restores the videos on relaunch', async () => {
  const testInfo = test.info();
  const profile = testInfo.outputPath('profile');
  running = await launchApp(profile, [VIDEOS.one, VIDEOS.two]);
  await expect.poll(() => videoCount(running.page)).toBe(2);
  await expect
    .poll(async () => (await storedState(running.page))?.videos.length)
    .toBe(2);
  expect(running.errors).toEqual([]);
  await running.app.close();

  running = await launchApp(profile);
  await expect.poll(() => videoCount(running.page)).toBe(2);
});
