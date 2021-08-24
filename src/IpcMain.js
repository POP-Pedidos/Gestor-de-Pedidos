const os = require("os");
const fs = require("fs");
const { app, ipcMain, nativeTheme, dialog } = require("electron");
const { autoUpdater } = require("electron-updater");
const AutoUpdater = require("./AutoUpdater");
const offscreen = require("./Offscreen");
const Store = require("./Store");
const Icons = require('./Icons');
const CreateTray = require("./SystemTray");
const local_api = require("./LocalAPI");

const printGraphicControlCopy = require("./Printer/graphic/control");
const printGraphicDeliveryCopy = require("./Printer/graphic/delivery");
const printGraphicProductionCopy = require("./Printer/graphic/production");

const printRawTextControlCopy = require("./Printer/raw_text/control");
const printRawTextDeliveryCopy = require("./Printer/raw_text/delivery");
const printRawTextProductionCopy = require("./Printer/raw_text/production");

const theme_store = new Store("dark-mode", { themeSource: "system" });
const app_store = new Store("app", { backgroundRunning: false });

ipcMain.on("hostname", (event) => event.returnValue = os.userInfo().username);
ipcMain.on("icons", (event) => event.returnValue = Icons);
ipcMain.on("app_name", (event) => event.returnValue = app.getName());

ipcMain.on("printers", (event) => {
    event.returnValue = win?.webContents.getPrinters()?.map(printer => printer.name);
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
    if (!win) return event.returnValue = null;

    if (win?.isMaximized()) event.returnValue = "maximized";
    else if (win?.isMinimized()) event.returnValue = "minimized";
    else if (win?.isNormal()) event.returnValue = "normal";
});

ipcMain.on("window:focus", (event) => {
    if (win.isMinimized()) win.restore();
    else win.show();

    win.focus();
});

ipcMain.on("taskbar:setProgressBar", (event, ...args) => {
    win.setProgressBar(...args);
});

ipcMain.on("taskbar:flashFrame", (event, flag) => {
    win.flashFrame(flag);
});

ipcMain.on("local_api:listen", (event) => {
    local_api.listen();
});

ipcMain.on("local_api:close", (event) => {
    local_api.close();
});

ipcMain.on("local_api:sockets:broadcast", (event, eventName, eventData) => {
    local_api.socketsBroadcast(eventName, eventData);
});

ipcMain.on("tray:initialize", (event, options = { disconnect_whatsapp: false }) => {
    if (tray && !tray.isDestroyed()) return;

    tray = CreateTray(options);
});

ipcMain.on("tray:destroy", (event) => {
    if (tray && !tray.isDestroyed()) tray.destroy();
});

ipcMain.on("tray:update", (event, options = {}) => {
    if (tray && !tray.isDestroyed()) {
        tray.loadContextMenu(options);
    }
});

ipcMain.on("tray:setIcon", (event, iconName) => {
    event.returnValue = tray.setIcon(Icons[iconName]);
});

ipcMain.on("updater:initialize", (event) => {
    AutoUpdater(win);
});

ipcMain.on("updater:install", (event) => {
    autoUpdater.quitAndInstall(false, true);
});

ipcMain.on("controls:minimize", (event) => {
    win.minimize();
});

ipcMain.on("controls:maximize", (event) => {
    win.maximize();
});

ipcMain.on("controls:restore", (event) => {
    win.restore();
});

ipcMain.on("controls:hide", (event) => {
    win.hide();
});

ipcMain.on("controls:close", (event) => {
    win.close();
});

ipcMain.handle("dialog:showSaveDialog", (event, ...args) => {
    return dialog.showSaveDialog(win, ...args);
});

ipcMain.handle("dialog:showMessageBox", (event, ...args) => {
    return dialog.showMessageBox(win, ...args);
});

ipcMain.on("fs:writeFile", (event, ...args) => {
    try {
        fs.writeFileSync(...args);
        event.returnValue = true;
    } catch {
        event.returnValue = false;
    }
});

ipcMain.on("app:openAtLogin", (event) => {
    const options = app.getLoginItemSettings();
    event.returnValue = options.executableWillLaunchAtLogin || options.openAtLogin;
});

ipcMain.on("app:setOpenAtLogin", (event, open) => {
    if (open === true) {
        app.setLoginItemSettings({
            name: "POPPedidos",
            openAtLogin: false,
        });
    }

    app.setLoginItemSettings({
        name: "POPPedidos",
        openAtLogin: open,
        executableWillLaunchAtLogin: open,
        path: process.execPath,
        args: [
            "--hidden",
        ]
    });
});

ipcMain.on("app:backgroundRunning", (event) => {
    event.returnValue = app_store.get("backgroundRunning");
});

ipcMain.on("app:setBackgroundRunning", (event, open) => {
    app_store.set("backgroundRunning", open);
});

ipcMain.handle("printService:printControlCopy", (event, printer, order, company) => {
    if (printer?.type === "text") return printRawTextControlCopy(printer, order, company);
    else return printGraphicControlCopy(printer, order, company);
});

ipcMain.handle("printService:printDeliveryCopy", (event, printer, order, company) => {
    if (printer?.type === "text") return printRawTextDeliveryCopy(printer, order, company);
    else return printGraphicDeliveryCopy(printer, order, company);
});

ipcMain.handle("printService:printProductionCopy", async (event, printer, order, company) => {
    if (printer?.type === "text") return printRawTextProductionCopy(printer, order, company);
    else return printGraphicProductionCopy(printer, order, company);
});

ipcMain.handle("offscreen:generateProductThumbnail", (event, data) => {
    return offscreen.generateProductThumbnail(data);
});

ipcMain.handle("offscreen:generateCompanyThumbnail", (event, company) => {
    return offscreen.generateCompanyThumbnail(company);
});

ipcMain.handle("offscreen:generateOrdersHTMLReport", (event, file_path, data) => {
    return offscreen.generateOrdersHTMLReport(file_path, data);
});