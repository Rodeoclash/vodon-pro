/**
 * This module executes inside of electron's main process. You can start
 * electron renderer process from here and communicate with the other processes
 * through IPC.
 */
import * as fsPromise from 'node:fs/promises';
import path from 'node:path';
import {
  app,
  BrowserWindow,
  type IpcMainInvokeEvent,
  ipcMain,
  shell,
} from 'electron';
import log from 'electron-log/main';
import { autoUpdater } from 'electron-updater';
import ffmpegBins from 'ffmpeg-ffprobe-static';
import ffmpeg from 'fluent-ffmpeg';
import { isDebug } from './env';
import MenuBuilder from './menu';
import {
  isSafeExternalUrl,
  isSameDocument,
  isTrustedSender,
} from './navigation';
import {
  assetsPath,
  preloadPath,
  rendererDir,
  rendererUrl,
  unpackedBinaryPath,
} from './paths';
import { createPendingSave } from './pendingSave';
import {
  handleAppProtocol,
  handleMediaProtocol,
  registerPrivilegedSchemes,
} from './protocols';

if (!ffmpegBins.ffprobePath) {
  throw new Error('Unable to find FFProbe path');
}

const ffprobePath = unpackedBinaryPath(ffmpegBins.ffprobePath);

if (!ffmpegBins.ffmpegPath) {
  throw new Error('Unable to find FFMpeg path');
}

const ffmpegPath = unpackedBinaryPath(ffmpegBins.ffmpegPath);

ffmpeg.setFfprobePath(ffprobePath);
ffmpeg.setFfmpegPath(ffmpegPath);

/**
 * Check GitHub Releases for a newer version, download it in the background
 * and notify the user; it installs on the next quit. Only packaged builds
 * can update.
 */
function startAutoUpdates() {
  log.transports.file.level = 'info';
  autoUpdater.logger = log;
  autoUpdater.checkForUpdatesAndNotify().catch(log.error);
}

let mainWindow: BrowserWindow | null = null;

const pendingSave = createPendingSave();

/** Open a web or mail link with the OS; refuse any other kind of URL. */
function openExternal(url: string) {
  if (!isSafeExternalUrl(url)) {
    log.warn('Refused to open URL externally:', url);
    return;
  }
  shell.openExternal(url).catch(log.error);
}

if (isDebug) {
  import('electron-debug')
    .then(({ default: electronDebug }) => electronDebug())
    .catch(log.error);
}

const installExtensions = async () => {
  const { installExtension, REACT_DEVELOPER_TOOLS } = await import(
    'electron-devtools-installer'
  );
  const forceDownload = !!process.env.UPGRADE_EXTENSIONS;

  return installExtension(REACT_DEVELOPER_TOOLS, { forceDownload }).catch(
    console.log,
  );
};

const createWindow = async () => {
  if (isDebug) {
    await installExtensions();
  }

  const assets = assetsPath(__dirname, app.isPackaged, process.resourcesPath);

  mainWindow = new BrowserWindow({
    show: false,
    width: 1920,
    height: 1080,
    title: 'Vodon Pro',
    icon: path.join(assets, 'icon.png'),
    webPreferences: {
      sandbox: false,
      preload: preloadPath(__dirname),
    },
  });

  mainWindow
    .loadURL(rendererUrl(app.isPackaged, process.env.ELECTRON_RENDERER_URL))
    .catch(log.error);

  mainWindow.on('ready-to-show', () => {
    if (!mainWindow) {
      throw new Error('"mainWindow" is not defined');
    }
    if (process.env.START_MINIMIZED) {
      mainWindow.minimize();
    } else {
      mainWindow.show();
      mainWindow.maximize();
    }
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  const menuBuilder = new MenuBuilder(mainWindow, pendingSave);
  menuBuilder.buildMenu();

  // Links that open a new window (target=_blank) go to the user's browser
  // instead, if they're web or mail links. No other windows are created.
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    openExternal(url);
    return { action: 'deny' };
  });

  // The window never leaves the app's page; links that would navigate it
  // (e.g. mailto:) are handed to the OS instead.
  mainWindow.webContents.on('will-navigate', (event, url) => {
    if (!mainWindow || isSameDocument(mainWindow.webContents.getURL(), url)) {
      return;
    }
    event.preventDefault();
    openExternal(url);
  });

  if (app.isPackaged) {
    startAutoUpdates();
  }
};

const gotTheLock = app.requestSingleInstanceLock();

/**
 * Add event listeners...
 */

/**
 * If the app is already running, quit, also, when a second instance is
 * launched then push the opened videos to the first.
 */
if (gotTheLock === false) {
  app.quit();
} else {
  app.on('second-instance', (_event, argV) => {
    /**
     * If we're loading multiple videos on a cold load, we need to wait a
     * couple of seconds to ensure that the first app is ready to receive
     * the new videos.
     */
    setTimeout(() => {
      if (!mainWindow) {
        return;
      }

      if (mainWindow.isMinimized()) {
        mainWindow.restore();
      }

      mainWindow.focus();
      mainWindow.webContents.send('onLoadAdditionalVideos', argV);
    }, 2000);
  });

  // Create myWindow, load the rest of the app, etc...
  app.on('ready', () => {});
}

app.on('window-all-closed', () => {
  // Respect the OSX convention of having the application in memory even
  // after all windows have been closed
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app
  .whenReady()
  .then(() => {
    handleAppProtocol(rendererDir(__dirname));
    handleMediaProtocol();
    createWindow().catch(log.error);
    app.on('activate', () => {
      // On macOS it's common to re-create a window in the app when the
      // dock icon is clicked and there are no other windows open.
      if (mainWindow === null) createWindow().catch(log.error);
    });
  })
  .catch(console.log);

/**
 * Register an IPC handler that only answers the app's own page (see
 * isTrustedSender); anything else gets an error.
 */
function handle(
  channel: string,
  listener: (event: IpcMainInvokeEvent, ...args: never[]) => unknown,
) {
  ipcMain.handle(channel, (event, ...args) => {
    const frame = event.senderFrame;
    const trusted =
      mainWindow !== null &&
      isTrustedSender(
        frame?.url,
        frame === mainWindow.webContents.mainFrame,
        mainWindow.webContents.getURL(),
      );
    if (!trusted) {
      log.warn(`Refused ${channel} from ${frame?.url ?? 'a closed frame'}`);
      throw new Error(`Refused ${channel}: untrusted sender`);
    }
    return listener(event, ...(args as never[]));
  });
}

/**
 * Get the current app version
 */
handle('app:getVersion', async () => {
  return app.getVersion();
});

/**
 * Get arguments passed to the app
 */
handle('app:getArgv', async () => {
  return process.argv;
});

/**
 * Saves the given project (string'd json) to the file the user just chose
 * in the "Save project as" dialog.
 */
handle('app:saveProject', async (_event, project: unknown) => {
  const filePath = pendingSave.take();
  if (filePath === null) {
    throw new Error('No project save was requested');
  }
  if (typeof project !== 'string') {
    throw new Error('Project must be a string');
  }
  await fsPromise.writeFile(filePath, project);
});

/**
 * Open a web link in the user's browser
 */
handle('app:openBrowser', async (_event, url: string) => {
  openExternal(url);
});

/**
 * Use ffprobe to find information about the given video
 */
handle('video:getMetadata', async (_event, filePath: string) => {
  const result = await new Promise((resolve) => {
    ffmpeg.ffprobe(filePath, (_err: unknown, metadata: object) => {
      resolve(metadata);
    });
  });

  return result;
});

/**
 * True if the video (filePath really) exists in the following location
 */
handle('video:exists', async (_event, filePath: string) => {
  try {
    await fsPromise.access(filePath);
    return true;
  } catch {
    return false;
  }
});

registerPrivilegedSchemes();
