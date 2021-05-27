const { autoUpdater } = require("electron-updater");
const { BrowserWindow, dialog } = require("electron");

autoUpdater.logger = require("electron-log");
autoUpdater.logger.transports.file.level = "info";

module.exports = (win) => {
    if (process.env.NODE_ENV === "development") return;

    autoUpdater.on("error", (error) => {
        const win = BrowserWindow.getFocusedWindow();

        dialog.showMessageBox(win, {
            title: "Updater Error",
            type: 'error',
            message: error.toString(),
        });
    });

    autoUpdater.on("checking-for-update", () => {
        win.webContents.send("updater:checking-for-update");
    });

    autoUpdater.on("update-available", (info) => {
        win.webContents.send("updater:update-available", info);
    });

    autoUpdater.on("update-not-available", (info) => {
        win.webContents.send("updater:update-not-available", info);

        setTimeout(() => autoUpdater.checkForUpdates(), 60000);
    });

    autoUpdater.on("error", (err) => {
        win.webContents.send("updater:error");
    });

    autoUpdater.on("download-progress", (progressObj) => {
        win.webContents.send("updater:checking-for-update", progressObj);
    });

    autoUpdater.on("update-downloaded", (event, info) => {
        win.webContents.send("updater:update-downloaded", info);
    });
    
    autoUpdater.checkForUpdates();
}