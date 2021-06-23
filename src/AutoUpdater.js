const { autoUpdater } = require("electron-updater");

// autoUpdater.autoDownload = false;

module.exports = (win) => {
    if (process.env.NODE_ENV === "development") return;

    let checkInterval;

    autoUpdater.logger = require("electron-log");
    autoUpdater.logger.transports.file.level = "info";

    autoUpdater.on("checking-for-update", () => {
        win.webContents.send("updater:checking-for-update");
    });

    autoUpdater.on("update-available", (info) => {
        win.webContents.send("updater:update-available", info);
    });

    autoUpdater.on("update-not-available", (info) => {
        win.webContents.send("updater:update-not-available", info);
    });

    autoUpdater.on("error", (error) => {
        win.webContents.send("updater:error", error);

        if (checkInterval) {
            clearInterval(checkInterval);
            checkInterval = setInterval(() => autoUpdater.checkForUpdates(), 60000 * 30); // 30 min
        }
    });

    autoUpdater.on("download-progress", (progressObj) => {
        win.webContents.send("updater:download-progress", progressObj);
    });

    autoUpdater.on("update-downloaded", (event, info) => {
        win.webContents.send("updater:update-downloaded", info);
    });

    autoUpdater.checkForUpdates();
    checkInterval = setInterval(() => autoUpdater.checkForUpdates(), 60000); // 1 min
}