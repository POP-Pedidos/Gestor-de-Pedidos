const { app, BrowserWindow } = require("electron");
const CreateWindow = require("./src/CreateWindow");

global.win = null;
global.tray = null;
global.local_api = null;

require("./src/IpcMain");

if (process.env.NODE_ENV === "development") {
    require('electron-reload')(__dirname);
}

app.setAppUserModelId("br.com.poppedidos");
app.originalUserAgent = app.userAgentFallback;
app.userAgentFallback = app.userAgentFallback.replace(/(POP|Electron).+? /g, "");

if (!app.requestSingleInstanceLock()) return app.quit();

app.whenReady().then(() => {
    win = CreateWindow();

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