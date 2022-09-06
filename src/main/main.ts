/* eslint global-require: off, no-console: off, promise/always-return: off */

/**
 * This module executes inside of electron's main process. You can start
 * electron renderer process from here and communicate with the other processes
 * through IPC.
 *
 * When running `npm run build` or `npm run build:main`, this file is compiled to
 * `./src/main.js` using webpack. This gives us some performance wins.
 */
import path from 'path';
import { app, BrowserWindow, shell, ipcMain, protocol } from 'electron';
import { autoUpdater } from 'electron-updater';
import log from 'electron-log';
import * as fsPromise from 'fs/promises';
import ffmpegBins from 'ffmpeg-ffprobe-static';
import ffmpeg from 'fluent-ffmpeg';
import os from 'os';
import MenuBuilder from './menu';
import { resolveHtmlPath } from './util';

if (!ffmpegBins.ffprobePath) {
  throw new Error('Unable to find FFProbe path');
}

const ffprobePath = ffmpegBins.ffprobePath.replace(
  'app.asar',
  'app.asar.unpacked'
);

if (!ffmpegBins.ffmpegPath) {
  throw new Error('Unable to find FFMpeg path');
}

const ffmpegPath = ffmpegBins.ffmpegPath.replace(
  'app.asar',
  'app.asar.unpacked'
);

ffmpeg.setFfprobePath(ffprobePath);
ffmpeg.setFfmpegPath(ffmpegPath);

const tmpDir = os.tmpdir();

export default class AppUpdater {
  constructor() {
    log.transports.file.level = 'info';
    autoUpdater.logger = log;
    autoUpdater.checkForUpdatesAndNotify();
  }
}

let mainWindow: BrowserWindow | null = null;

if (process.env.NODE_ENV === 'production') {
  const sourceMapSupport = require('source-map-support');
  sourceMapSupport.install();
}

const isDebug =
  process.env.NODE_ENV === 'development' || process.env.DEBUG_PROD === 'true';

if (isDebug) {
  require('electron-debug')();
}

const installExtensions = async () => {
  const installer = require('electron-devtools-installer');
  const forceDownload = !!process.env.UPGRADE_EXTENSIONS;
  const extensions = ['REACT_DEVELOPER_TOOLS'];

  return installer
    .default(
      extensions.map((name) => installer[name]),
      forceDownload
    )
    .catch(console.log);
};

const createWindow = async () => {
  if (isDebug) {
    await installExtensions();
  }

  const RESOURCES_PATH = app.isPackaged
    ? path.join(process.resourcesPath, 'assets')
    : path.join(__dirname, '../../assets');

  const getAssetPath = (...paths: string[]): string => {
    return path.join(RESOURCES_PATH, ...paths);
  };

  mainWindow = new BrowserWindow({
    show: false,
    width: 1920,
    height: 1080,
    title: 'Vodon Pro',
    icon: getAssetPath('icon.png'),
    webPreferences: {
      webSecurity: false,
      sandbox: false,
      preload: app.isPackaged
        ? path.join(__dirname, 'preload.js')
        : path.join(__dirname, '../../.erb/dll/preload.js'),
    },
  });

  mainWindow.loadURL(resolveHtmlPath('index.html'));

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

  // Remove this if your app does not use auto updates
  // eslint-disable-next-line
  // new AppUpdater();
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
    createWindow();
    app.on('activate', () => {
      // On macOS it's common to re-create a window in the app when the
      // dock icon is clicked and there are no other windows open.
      if (mainWindow === null) createWindow();
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
  }
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
        .on('error', (err: any) => {
          reject(err);
        })
        // take 2 screenshots at predefined timemarks and size
        .takeScreenshots(
          { timemarks: [second], size: '854x480', filename: '%s.png' },
          tmpDir
        );
    });
  }
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
