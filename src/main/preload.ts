/*
import { contextBridge, ipcRenderer, IpcRendererEvent } from 'electron';

contextBridge.exposeInMainWorld('electron', {
  ipcRenderer: {
    myPing() {
      ipcRenderer.send('ipc-example', 'ping');
    },
    on(channel: string, func: (...args: unknown[]) => void) {
      const validChannels = ['ipc-example'];
      if (validChannels.includes(channel)) {
        const subscription = (_event: IpcRendererEvent, ...args: unknown[]) =>
          func(...args);
        // Deliberately strip event as it includes `sender`
        ipcRenderer.on(channel, subscription);

        return () => ipcRenderer.removeListener(channel, subscription);
      }

      return undefined;
    },
    once(channel: string, func: (...args: unknown[]) => void) {
      const validChannels = ['ipc-example'];
      if (validChannels.includes(channel)) {
        // Deliberately strip event as it includes `sender`
        ipcRenderer.once(channel, (_event, ...args) => func(...args));
      }
    },
  },
});
*/

const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('app', {
  getVersion: () => ipcRenderer.invoke('app:getVersion'),
  saveProject: (filePath: string, project: string) =>
    ipcRenderer.invoke('app:saveProject', filePath, project),
  onNewProjectRequest: (callback: (_event: any) => void) =>
    ipcRenderer.on('onNewProjectRequest', callback),
  onSaveProjectRequest: (callback: (event: any, filePath: string) => void) =>
    ipcRenderer.on('onSaveProjectRequest', callback),
  onLoadProjectRequest: (callback: (event: any, project: string) => void) =>
    ipcRenderer.on('onLoadProjectRequest', callback),
});

contextBridge.exposeInMainWorld('video', {
  exists: (filePath: string) => ipcRenderer.invoke('video:exists', filePath),
  getMetadata: (filePath: string) =>
    ipcRenderer.invoke('video:getMetadata', filePath),
});
