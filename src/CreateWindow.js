const { BrowserWindow, screen, shell, nativeTheme } = require("electron");
const path = require("path");
const Store = require("./Store");
const { icon } = require("../config");

module.exports = function CreateWindow() {
    const workAreaSize = screen.getPrimaryDisplay().workAreaSize

    let width = parseInt(workAreaSize.width / 1.3);
    let height = parseInt(workAreaSize.height / 1.3);
    if (width > height * 2) width = height * 2;

    const store = new Store("window", { width, height });
    const theme_store = new Store("dark-mode", { themeSource: "system" });

    const win = new BrowserWindow({
        title: "POP Pedidos",
        icon,
        width: store.get("maximized") ? width : store.get("width"),
        height: store.get("maximized") ? height : store.get("height"),
        minWidth: 700,
        minHeight: 400,
        titleBarStyle: "hidden",
        frame: false,
        show: false,
        webPreferences: {
            preload: path.join(__dirname, "../assets/scripts/preload.js"),
            nodeIntegration: false,
            contextIsolation: true,
            enableRemoteModule: false,
            webviewTag: true,
            nativeWindowOpen: true,
        }
    });

    win.removeMenu();
    win.loadFile('assets/pages/login/index.html');

    win.once('ready-to-show', () => {
        nativeTheme.themeSource = theme_store.get("themeSource");
        if (store.get("maximized") === true) win.maximize();
        win.show();
    });

    win.webContents.setWindowOpenHandler(({ url }) => {
        try {
            setImmediate(() => shell.openExternal(url));
        } catch { }

        return { action: "deny" };
    })

    win.on('close', function (e) {
        const bounds = win.getBounds();

        store.set("maximized", win.isMaximized());
        store.set("width", bounds.width);
        store.set("height", bounds.height);
    });

    return win;
}