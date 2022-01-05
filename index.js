const { app, BrowserWindow } = require("electron");
const CreateWindow = require("./src/CreateWindow");
const CreateSplashScreen = require("./src/CreateSplashScreen");

global.win = null;
global.tray = null;
global.local_api = null;
global.whatsapp_number = null;

require("./src/IpcMain");

if (process.env.NODE_ENV === "development") {
    require('electron-reload')(__dirname);
}

app.setAppUserModelId("br.com.poppedidos");
app.originalUserAgent = app.userAgentFallback;
app.userAgentFallback = app.userAgentFallback.replace(/(POP|Electron).+? /g, "");

process.env['ELECTRON_DISABLE_SECURITY_WARNINGS'] = 'true';

if (!app.requestSingleInstanceLock()) return app.quit();

app.whenReady().then(() => {
    let splash = CreateSplashScreen();

    splash.webContents.once("did-finish-load", () => {
        win = CreateWindow();

        splash.once("close", function (e) {
            win.destroy();
        });

        win.webContents.once("did-finish-load", () => {
            splash.destroy();
            splash = null;
        });
    });

    app.on("second-instance", (event, commandLine, workingDirectory) => {
        if (splash) {
            splash.focus();
        } else if (win) {
            win.show();
            win.focus();
        }
    });
});

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) win = CreateWindow();
});

app.on('window-all-closed', () => {
    app.quit();
});