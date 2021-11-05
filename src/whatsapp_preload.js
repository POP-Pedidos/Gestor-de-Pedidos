const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld("main", {
    send: (event, ...args) => ipcRenderer.sendToHost(event, ...(args.map(arg => JSON.stringify(arg)))),
    on: (...args) => ipcRenderer.on(...args),
    once: (...args) => ipcRenderer.once(...args),
    Authenticated: () => ipcRenderer.sendToHost("authenticated"),
});

ipcRenderer.on("setDarkMode", (e, enabled) => {
    const className = `web ${enabled ? "dark" : "light"}`;

    if (document.body.className != className) document.body.className = className;
});