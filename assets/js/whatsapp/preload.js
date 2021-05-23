const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld("main", {
    send: (...args) => ipcRenderer.sendToHost(...args),
    on: (...args) => ipcRenderer.on(...args),
    Authenticated: () => ipcRenderer.sendToHost("authenticated"),
});

ipcRenderer.on("setDarkMode", (e, enabled) => {
    const className = `web ${enabled ? "dark" : "light"}`;

    if (document.body.className != className) document.body.className = className;
});