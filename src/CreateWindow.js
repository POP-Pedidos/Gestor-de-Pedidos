const { BrowserWindow } = require("electron");

module.exports = function CreateWindow() {
    const win = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
            webviewTag: true,
        }
    })

    win.removeMenu();
    win.loadFile('assets/pages/login/index.html');

    return win;
}