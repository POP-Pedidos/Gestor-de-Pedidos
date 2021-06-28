const { app, BrowserWindow } = require("electron");
const CreateWindow = require("./src/CreateWindow");
const CreateTray = require("./src/SystemTray");

global.win = null;
global.tray = null;

require("./src/IpcMain");

if (process.env.NODE_ENV === "development") {
    require('electron-reload')(__dirname);
}

app.setAppUserModelId("poppedidos.com.br");
app.originalUserAgent = app.userAgentFallback;
app.userAgentFallback = app.userAgentFallback.replace(/(POP|Electron).+? /g, "");

if (!app.requestSingleInstanceLock()) return app.quit();

app.whenReady().then(() => {
    win = CreateWindow();
    tray = CreateTray();

    app.on("second-instance", (event, commandLine, workingDirectory) => {
        win.show();
        win.focus();
    });
});

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) win = CreateWindow();
});

app.on('window-all-closed', () => {
    app.quit();
});