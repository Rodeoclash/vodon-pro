import * as fs from 'node:fs/promises';
import {
  app,
  type BrowserWindow,
  dialog,
  Menu,
  type MenuItemConstructorOptions,
  shell,
} from 'electron';
import { isDebug } from './env';
import { createLastFolder } from './lastFolder';

interface DarwinMenuItemConstructorOptions extends MenuItemConstructorOptions {
  selector?: string;
  submenu?: DarwinMenuItemConstructorOptions[] | Menu;
}

export default class MenuBuilder {
  mainWindow: BrowserWindow;

  lastFolder = createLastFolder(app.getPath('documents'));

  constructor(mainWindow: BrowserWindow) {
    this.mainWindow = mainWindow;
  }

  async openProject(): Promise<void> {
    const result = await dialog.showOpenDialog(this.mainWindow, {
      defaultPath: this.lastFolder.get(),
      properties: ['openFile'],
      filters: [{ name: 'JSON', extensions: ['json'] }],
    });

    if (result.canceled === false) {
      const [filePath] = result.filePaths;
      this.lastFolder.rememberFile(filePath);
      const contents = await fs.readFile(filePath);
      this.mainWindow.webContents.send(
        'onLoadProjectRequest',
        contents.toString(),
      );
    }
  }

  async saveProjectAs(): Promise<void> {
    const result = await dialog.showSaveDialog(this.mainWindow, {
      defaultPath: this.lastFolder.get(),
      properties: ['createDirectory', 'showOverwriteConfirmation'],
      filters: [{ name: 'JSON', extensions: ['json'] }],
    });

    if (result.canceled === false && result.filePath) {
      this.lastFolder.rememberFile(result.filePath);
      this.mainWindow.webContents.send('onSaveProjectRequest', result.filePath);
    }
  }

  buildMenu(): Menu {
    if (isDebug) {
      this.setupDevelopmentEnvironment();
    }

    const template =
      process.platform === 'darwin'
        ? this.buildDarwinTemplate()
        : this.buildDefaultTemplate();

    const menu = Menu.buildFromTemplate(template);
    Menu.setApplicationMenu(menu);

    return menu;
  }

  setupDevelopmentEnvironment(): void {
    this.mainWindow.webContents.on('context-menu', (_, props) => {
      const { x, y } = props;

      Menu.buildFromTemplate([
        {
          label: 'Inspect element',
          click: () => {
            this.mainWindow.webContents.inspectElement(x, y);
          },
        },
      ]).popup({ window: this.mainWindow });
    });
  }

  buildDarwinTemplate(): MenuItemConstructorOptions[] {
    const subMenuAbout: DarwinMenuItemConstructorOptions = {
      label: 'Electron',
      submenu: [
        {
          label: 'About ElectronReact',
          selector: 'orderFrontStandardAboutPanel:',
        },
        { type: 'separator' },
        { label: 'Services', submenu: [] },
        { type: 'separator' },
        {
          label: 'Hide ElectronReact',
          accelerator: 'Command+H',
          selector: 'hide:',
        },
        {
          label: 'Hide Others',
          accelerator: 'Command+Shift+H',
          selector: 'hideOtherApplications:',
        },
        { label: 'Show All', selector: 'unhideAllApplications:' },
        { type: 'separator' },
        {
          label: 'Quit',
          accelerator: 'Command+Q',
          click: () => {
            app.quit();
          },
        },
      ],
    };
    const subMenuFile: DarwinMenuItemConstructorOptions = {
      label: 'File',
      submenu: [
        {
          label: 'New project',
          accelerator: 'Command+N',
          click: () => {
            this.mainWindow.webContents.send('onNewProjectRequest');
          },
        },
        {
          label: 'Open project...',
          accelerator: 'Command+O',
          click: () => this.openProject(),
        },
        {
          label: 'Save project as...',
          accelerator: 'Command+Shift+S',
          click: () => this.saveProjectAs(),
        },
      ],
    };

    const subMenuEdit: DarwinMenuItemConstructorOptions = {
      label: 'Edit',
      submenu: [
        { label: 'Undo', accelerator: 'Command+Z', selector: 'undo:' },
        { label: 'Redo', accelerator: 'Shift+Command+Z', selector: 'redo:' },
        { type: 'separator' },
        { label: 'Cut', accelerator: 'Command+X', selector: 'cut:' },
        { label: 'Copy', accelerator: 'Command+C', selector: 'copy:' },
        { label: 'Paste', accelerator: 'Command+V', selector: 'paste:' },
        {
          label: 'Select All',
          accelerator: 'Command+A',
          selector: 'selectAll:',
        },
      ],
    };
    const subMenuViewDev: MenuItemConstructorOptions = {
      label: 'View',
      submenu: [
        {
          label: 'Reload',
          accelerator: 'Command+R',
          click: () => {
            this.mainWindow.webContents.reload();
          },
        },
        {
          label: 'Toggle Full Screen',
          accelerator: 'Ctrl+Command+F',
          click: () => {
            this.mainWindow.setFullScreen(!this.mainWindow.isFullScreen());
          },
        },
        {
          label: 'Toggle Developer Tools',
          accelerator: 'Alt+Command+I',
          click: () => {
            this.mainWindow.webContents.toggleDevTools();
          },
        },
      ],
    };
    const subMenuViewProd: MenuItemConstructorOptions = {
      label: 'View',
      submenu: [
        {
          label: 'Toggle Full Screen',
          accelerator: 'Ctrl+Command+F',
          click: () => {
            this.mainWindow.setFullScreen(!this.mainWindow.isFullScreen());
          },
        },
      ],
    };
    const subMenuWindow: DarwinMenuItemConstructorOptions = {
      label: 'Window',
      submenu: [
        {
          label: 'Minimize',
          accelerator: 'Command+M',
          selector: 'performMiniaturize:',
        },
        { label: 'Close', accelerator: 'Command+W', selector: 'performClose:' },
        { type: 'separator' },
        { label: 'Bring All to Front', selector: 'arrangeInFront:' },
      ],
    };
    const subMenuHelp: MenuItemConstructorOptions = {
      label: 'Help',
      submenu: [
        {
          label: 'About Vodon Pro',
          click() {
            shell.openExternal('https://github.com/Rodeoclash/vodon-pro');
          },
        },
        {
          label: 'Community Discussions',
          click() {
            shell.openExternal(
              'https://github.com/Rodeoclash/vodon-pro/discussions',
            );
          },
        },
        {
          label: 'Report Issues',
          click() {
            shell.openExternal(
              'https://github.com/Rodeoclash/vodon-pro/issues',
            );
          },
        },
      ],
    };

    const subMenuView = isDebug ? subMenuViewDev : subMenuViewProd;

    return [
      subMenuAbout,
      subMenuFile,
      subMenuEdit,
      subMenuView,
      subMenuWindow,
      subMenuHelp,
    ];
  }

  buildDefaultTemplate() {
    const templateDefault = [
      {
        label: '&File',
        submenu: [
          {
            label: 'New project',
            click: () => {
              this.mainWindow.webContents.send('onNewProjectRequest');
            },
          },
          {
            label: 'Load project...',
            click: () => this.openProject(),
          },
          {
            label: 'Save project as...',
            click: () => this.saveProjectAs(),
          },
        ],
      },
      {
        label: '&View',
        submenu: isDebug
          ? [
              {
                label: '&Reload',
                accelerator: 'Ctrl+R',
                click: () => {
                  this.mainWindow.webContents.reload();
                },
              },
              {
                label: 'Toggle &Full Screen',
                accelerator: 'F11',
                click: () => {
                  this.mainWindow.setFullScreen(
                    !this.mainWindow.isFullScreen(),
                  );
                },
              },
              {
                label: 'Toggle &Developer Tools',
                accelerator: 'Alt+Ctrl+I',
                click: () => {
                  this.mainWindow.webContents.toggleDevTools();
                },
              },
            ]
          : [
              {
                label: 'Toggle &Full Screen',
                accelerator: 'F11',
                click: () => {
                  this.mainWindow.setFullScreen(
                    !this.mainWindow.isFullScreen(),
                  );
                },
              },
              {
                label: 'Toggle &Developer Tools',
                accelerator: 'Alt+Ctrl+I',
                click: () => {
                  this.mainWindow.webContents.toggleDevTools();
                },
              },
            ],
      },
      {
        label: 'Help',
        submenu: [
          {
            label: 'Learn More',
            click() {
              shell.openExternal('https://electronjs.org');
            },
          },
          {
            label: 'Documentation',
            click() {
              shell.openExternal(
                'https://github.com/electron/electron/tree/main/docs#readme',
              );
            },
          },
          {
            label: 'Community Discussions',
            click() {
              shell.openExternal('https://www.electronjs.org/community');
            },
          },
          {
            label: 'Search Issues',
            click() {
              shell.openExternal('https://github.com/electron/electron/issues');
            },
          },
        ],
      },
    ];

    return templateDefault;
  }
}
