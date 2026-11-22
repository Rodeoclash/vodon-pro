/**
 * This module executes inside of electron's main process. You can start
 * electron renderer process from here and communicate with the other processes
 * through IPC.
 */
import * as fsPromise from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { app, BrowserWindow, ipcMain, protocol, shell } from 'electron';
import log from 'electron-log/main';
import { autoUpdater } from 'electron-updater';
import ffmpegBins from 'ffmpeg-ffprobe-static';
import ffmpeg from 'fluent-ffmpeg';
import { isDebug } from './env';
import MenuBuilder from './menu';
import {
  assetsPath,
  preloadPath,
  rendererLocation,
  unpackedBinaryPath,
} from './paths';

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

const tmpDir = os.tmpdir();

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
      webSecurity: false,
      sandbox: false,
      preload: preloadPath(__dirname),
    },
  });

  const page = rendererLocation(
    __dirname,
    app.isPackaged,
    process.env.ELECTRON_RENDERER_URL,
  );
  if (page.kind === 'url') {
    mainWindow.loadURL(page.url).catch(log.error);
  } else {
    mainWindow.loadFile(page.file).catch(log.error);
  }

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

  const menuBuilder = new MenuBuilder(mainWindow);
  menuBuilder.buildMenu();

  // Open urls in the user's browser
  mainWindow.webContents.setWindowOpenHandler((edata) => {
    shell.openExternal(edata.url);
    return { action: 'deny' };
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
    createWindow().catch(log.error);
    app.on('activate', () => {
      // On macOS it's common to re-create a window in the app when the
      // dock icon is clicked and there are no other windows open.
      if (mainWindow === null) createWindow().catch(log.error);
    });
  })
  .catch(console.log);

/**
 * Get the current app version
 */
ipcMain.handle('app:getVersion', async () => {
  return app.getVersion();
});

/**
 * Get arguments passed to the app
 */
ipcMain.handle('app:getArgv', async () => {
  return process.argv;
});

/**
 * Saves the given project (string'd json) to the supplied filePath
 */
ipcMain.handle(
  'app:saveProject',
  async (_event, filePath: string, project: string) => {
    return fsPromise.writeFile(filePath, project);
  },
);

/**
 * Saves the given project (string'd json) to the supplied filePath
 */
ipcMain.handle('app:openBrowser', async (_event, url: string) => {
  shell.openExternal(url);
});

/**
 * Use ffprobe to find information about the given video
 */
ipcMain.handle('video:getMetadata', async (_event, filePath: string) => {
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
ipcMain.handle('video:exists', async (_event, filePath: string) => {
  try {
    await fsPromise.access(filePath);
    return true;
  } catch {
    return false;
  }
});

/**
 * Take a screenshot of the file at particular time and return it
 */
ipcMain.handle(
  'video:screenshot',
  (_event, filePath: string, second: number) => {
    return new Promise((resolve, reject) => {
      ffmpeg(filePath)
        .on('end', () => {
          resolve(path.join(tmpDir, `${second}.png`));
        })
        .on('error', (err: Error) => {
          reject(err);
        })
        // take 2 screenshots at predefined timemarks and size
        .takeScreenshots(
          { timemarks: [second], size: '854x480', filename: '%s.png' },
          tmpDir,
        );
    });
  },
);

// allow local videos
protocol.registerSchemesAsPrivileged([
  {
    scheme: 'file',
    privileges: {
      standard: true,
      bypassCSP: true,
      allowServiceWorkers: true,
      supportFetchAPI: true,
      corsEnabled: true,
      stream: true,
    },
  },
]);
