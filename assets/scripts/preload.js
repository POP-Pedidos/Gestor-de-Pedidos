const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("api_url", ipcRenderer.sendSync("api_url"));
contextBridge.exposeInMainWorld("places_url", ipcRenderer.sendSync("places_url"));
contextBridge.exposeInMainWorld("domain", ipcRenderer.sendSync("domain"));
contextBridge.exposeInMainWorld("hostname", ipcRenderer.sendSync("hostname"));
contextBridge.exposeInMainWorld("icon", ipcRenderer.sendSync("icon"));
contextBridge.exposeInMainWorld("app_name", ipcRenderer.sendSync("app_name"));

contextBridge.exposeInMainWorld("GetPrintersList", () => ipcRenderer.sendSync("printers"));

contextBridge.exposeInMainWorld("controls", {
    onMaximize: (callback) => ipcRenderer.on("maximize", callback),
    onUnMaximize: (callback) => ipcRenderer.on("unmaximize", callback),
    onTitleChanged: (callback) => ipcRenderer.on("page-title-updated", callback),
    state: () => ipcRenderer.sendSync("controls:state"),
    minimize: () => ipcRenderer.send("controls:minimize"),
    maximize: () => ipcRenderer.send("controls:maximize"),
    restore: () => ipcRenderer.send("controls:restore"),
    close: () => ipcRenderer.send("controls:close"),
});

contextBridge.exposeInMainWorld("darkMode", {
    toggle: () => ipcRenderer.sendSync("dark-mode:toggle"),
    system: () => ipcRenderer.sendSync("dark-mode:system"),
    theme: () => ipcRenderer.sendSync("dark-mode:themeSource"),
    isEnabled: () => ipcRenderer.sendSync("dark-mode:enabled"),
});

contextBridge.exposeInMainWorld("printService", {
    printControlCopy: (...args) => ipcRenderer.send("printService:printControlCopy", ...args),
    printDeliveryCopy: (...args) => ipcRenderer.send("printService:printDeliveryCopy", ...args),
    printProductionCopy: (...args) => ipcRenderer.send("printService:printProductionCopy", ...args),
});

contextBridge.exposeInMainWorld("dialog", {
    showSaveDialog: (...args) => ipcRenderer.invoke("dialog:showSaveDialog", ...args),
});

contextBridge.exposeInMainWorld("updater", {
    on: (event_name, ...args) => ipcRenderer.on(`updater:${event_name}`, ...args),
    installUpdate: (...args) => ipcRenderer.send("updater:install", ...args),
});

contextBridge.exposeInMainWorld("filesystem", {
    writeFile: (...args) => ipcRenderer.sendSync("fs:writeFile", ...args),
});

contextBridge.exposeInMainWorld("offscreen", {
    generateProductThumbnail: (product) => ipcRenderer.invoke("offscreen:generateProductThumbnail", product),
    generateCompanyThumbnail: (company) => ipcRenderer.invoke("offscreen:generateCompanyThumbnail", company),
    generateOrdersHTMLReport: (file_path, data) => ipcRenderer.invoke("offscreen:generateOrdersHTMLReport", file_path, data),
});