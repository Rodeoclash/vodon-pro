const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("appDetails", {
  getVersion: () => ipcRenderer.invoke("appDetails:getVersion"),
});
