let { ipcRenderer } = require("electron");

window.api_url = ipcRenderer.sendSync("api_url");
window.places_url = ipcRenderer.sendSync("places_url");
window.domain = ipcRenderer.sendSync("domain");
window.hostname = ipcRenderer.sendSync("hostname");
window.icons = ipcRenderer.sendSync("icons");
window.app_name = ipcRenderer.sendSync("app_name");

window.GetPrintersList = () => ipcRenderer.sendSync("printers");

window.taskbar = {
    setProgressBar: (...args) => ipcRenderer.send("taskbar:setProgressBar", ...args),
    flashFrame: (flag = true) => ipcRenderer.send("taskbar:flashFrame", flag),
}

window.tray = {
    setIcon: (iconName) => ipcRenderer.sendSync("tray:setIcon", iconName),
    initialize: () => ipcRenderer.send("tray:initialize"),
    destroy: () => ipcRenderer.send("tray:destroy"),
    update: (options) => ipcRenderer.send("tray:update", options),
}

window.controls = {
    onMaximize: (callback) => ipcRenderer.on("maximize", callback),
    onUnMaximize: (callback) => ipcRenderer.on("unmaximize", callback),
    onTitleChanged: (callback) => ipcRenderer.on("page-title-updated", callback),
    state: () => ipcRenderer.sendSync("controls:state"),
    minimize: () => ipcRenderer.send("controls:minimize"),
    maximize: () => ipcRenderer.send("controls:maximize"),
    restore: () => ipcRenderer.send("controls:restore"),
    hide: () => ipcRenderer.send("controls:hide"),
}

window.darkMode = {
    toggle: () => ipcRenderer.sendSync("dark-mode:toggle"),
    system: () => ipcRenderer.sendSync("dark-mode:system"),
    theme: () => ipcRenderer.sendSync("dark-mode:themeSource"),
    isEnabled: () => ipcRenderer.sendSync("dark-mode:enabled"),
}

window.printService = {
    printControlCopy: (...args) => ipcRenderer.invoke("printService:printControlCopy", ...args),
    printDeliveryCopy: (...args) => ipcRenderer.invoke("printService:printDeliveryCopy", ...args),
    printProductionCopy: (...args) => ipcRenderer.invoke("printService:printProductionCopy", ...args),
}

window.dialog = {
    showSaveDialog: (...args) => ipcRenderer.invoke("dialog:showSaveDialog", ...args),
    showMessageBox: (...args) => ipcRenderer.invoke("dialog:showMessageBox", ...args),
}

window.updater = {
    on: (event_name, ...args) => ipcRenderer.on(`updater:${event_name}`, ...args),
    initialize: () => ipcRenderer.send("updater:initialize"),
    installUpdate: (...args) => ipcRenderer.send("updater:install", ...args),
}

window.filesystem = {
    writeFile: (...args) => ipcRenderer.sendSync("fs:writeFile", ...args),
}

window.offscreen = {
    generateProductThumbnail: (product) => ipcRenderer.invoke("offscreen:generateProductThumbnail", product),
    generateCompanyThumbnail: (company) => ipcRenderer.invoke("offscreen:generateCompanyThumbnail", company),
    generateOrdersHTMLReport: (file_path, data) => ipcRenderer.invoke("offscreen:generateOrdersHTMLReport", file_path, data),
}