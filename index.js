const { app, BrowserWindow } = require("electron");
const CreateWindow = require("./src/CreateWindow");

global.win = null;

require("./src/IpcMain");

if (process.env.NODE_ENV === "development") {
    require('electron-reload')(__dirname, {
        electron: require(`${__dirname}/node_modules/electron`),
        hardResetMethod: "exit"
    });
}

app.setAppUserModelId("poppedidos.com.br");
app.originalUserAgent = app.userAgentFallback;
app.userAgentFallback = app.userAgentFallback.replace(/(POP|Electron).+? /g, "");

if (!app.requestSingleInstanceLock()) return app.quit();

app.on("second-instance", (event, commandLine, workingDirectory) => {
    if (!win) return;

    if (win.isMinimized()) win.restore();
    win.focus();
});

app.whenReady().then(() => {
    win = CreateWindow();
});

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) win = CreateWindow();
});

app.on('window-all-closed', () => {
    app.quit();
});