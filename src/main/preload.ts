import { contextBridge, ipcRenderer, webUtils } from 'electron';

contextBridge.exposeInMainWorld('app', {
  getVersion: () => ipcRenderer.invoke('app:getVersion'),
  getArgv: () => ipcRenderer.invoke('app:getArgv'),
  saveProject: (filePath: string, project: string) =>
    ipcRenderer.invoke('app:saveProject', filePath, project),
  openBrowser: (url: string) => ipcRenderer.invoke('app:openBrowser', url),
  // Callbacks get the payload only: the IPC event (and its sender) stays here.
  onNewProjectRequest: (callback: () => void) =>
    ipcRenderer.on('onNewProjectRequest', () => callback()),
  onSaveProjectRequest: (callback: (filePath: string) => void) =>
    ipcRenderer.on('onSaveProjectRequest', (_event, filePath: string) =>
      callback(filePath),
    ),
  onLoadProjectRequest: (callback: (project: string) => void) =>
    ipcRenderer.on('onLoadProjectRequest', (_event, project: string) =>
      callback(project),
    ),
  onLoadAdditionalVideos: (callback: (argV: Array<string>) => void) =>
    ipcRenderer.on('onLoadAdditionalVideos', (_event, argV: Array<string>) =>
      callback(argV),
    ),
});

contextBridge.exposeInMainWorld('video', {
  exists: (filePath: string) => ipcRenderer.invoke('video:exists', filePath),
  getMetadata: (filePath: string) =>
    ipcRenderer.invoke('video:getMetadata', filePath),
  // File.path was removed in Electron 32; this is its replacement.
  getPathForFile: (file: File) => webUtils.getPathForFile(file),
});
