const { app, ipcMain, BrowserWindow, nativeTheme } = require("electron");
const { domain, api_url, places_url, icon } = require("../config");
const os = require("os");
const Store = require("./Store");
const theme_store = new Store("dark-mode", { themeSource: "system" });

ipcMain.on("api_url", (event) => event.returnValue = api_url);
ipcMain.on("places_url", (event) => event.returnValue = places_url);
ipcMain.on("domain", (event) => event.returnValue = domain);
ipcMain.on("hostname", (event) => event.returnValue = os.userInfo().username);
ipcMain.on("icon", (event) => event.returnValue = icon);
ipcMain.on("app_name", (event) => event.returnValue = app.getName());

ipcMain.on("printers", (event) => {
    const win = BrowserWindow.getFocusedWindow();

    event.returnValue = win.webContents.getPrinters()?.map(printer => printer.name || printer.displayName);
});

ipcMain.on("dark-mode:themeSource", (event) => event.returnValue = nativeTheme.themeSource);
ipcMain.on("dark-mode:enabled", (event) => event.returnValue = nativeTheme.shouldUseDarkColors);

ipcMain.on("dark-mode:toggle", (event) => {
    nativeTheme.themeSource = !!nativeTheme.shouldUseDarkColors ? "light" : "dark";
    theme_store.set("themeSource", nativeTheme.themeSource);

    event.returnValue = nativeTheme.shouldUseDarkColors
});

ipcMain.on("dark-mode:system", (event) => {
    nativeTheme.themeSource = "system";
    theme_store.set("themeSource", "system");
});

ipcMain.on("controls:state", (event) => {
    const win = BrowserWindow.getFocusedWindow();
    if (!win) return event.returnValue = null;

    if (win.isMaximized()) event.returnValue = "maximized";
    else if (win.isMinimized()) event.returnValue = "minimized";
    else if (win.isNormal()) event.returnValue = "normal";
});

ipcMain.on("controls:minimize", (event) => {
    const win = BrowserWindow.getFocusedWindow();

    win.minimize();
});

ipcMain.on("controls:maximize", (event) => {
    const win = BrowserWindow.getFocusedWindow();

    win.maximize();
});

ipcMain.on("controls:restore", (event) => {
    const win = BrowserWindow.getFocusedWindow();

    win.restore();
});

ipcMain.on("controls:close", (event) => {
    const win = BrowserWindow.getFocusedWindow();

    win.hide();
    app.exit(0);
});

module.exports = ipcMain;