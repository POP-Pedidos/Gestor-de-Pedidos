const CreateWindow = require("./CreateWindow");
const RegisterShortcuts = require("./RegisterShortcuts");
const IpcMain = require("./IpcMain");
const AutoUpdater = require("./AutoUpdater");
const { setTimeout } = require("globalthis/implementation");

module.exports = function App() {
    const win = CreateWindow();

    RegisterShortcuts(win);
    setTimeout(() => AutoUpdater(win), 5000);

    win.on('maximize', function (e) {
        win.webContents.send("maximize");
    });

    win.on('unmaximize', function (e) {
        win.webContents.send("unmaximize");
    });

    win.on('page-title-updated', function (e, title) {
        win.webContents.send("page-title-updated", title);
    });
}