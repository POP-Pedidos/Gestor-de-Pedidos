const { app, BrowserWindow, screen, shell, nativeTheme, dialog } = require("electron");
const path = require("path");

const Store = require("./Store");
const RegisterShortcuts = require("./RegisterShortcuts");

const { icon } = require("../config");

module.exports = function CreateWindow() {
    const workAreaSize = screen.getPrimaryDisplay().workAreaSize

    let width = parseInt(workAreaSize.width / 1.3);
    let height = parseInt(workAreaSize.height / 1.3);
    if (width > height * 2) width = height * 2;

    const win = new BrowserWindow({
        title: "POP Pedidos",
        icon,
        width,
        height,
        minWidth: 700,
        minHeight: 400,
        titleBarStyle: "hidden",
        frame: false,
        show: false,
        webPreferences: {
            preload: path.join(__dirname, "../assets/scripts/preload.js"),
            nodeIntegration: true,
            contextIsolation: false,
            enableRemoteModule: false,
            webviewTag: true,
            nativeWindowOpen: true,
        },
    });

    const store = new Store("window", { width, height });
    const theme_store = new Store("dark-mode", { themeSource: "system" });

    nativeTheme.themeSource = theme_store.get("themeSource");

    win.removeMenu();

    // win.webContents.setWindowOpenHandler(({ url }) => {
    //     try {
    //         setImmediate(() => shell.openExternal(url));
    //     } catch { }

    //     return { action: "deny" };
    // });

    win.webContents.on('new-window', function (e, url) {
        e.preventDefault();
        require('electron').shell.openExternal(url);
    });

    win.webContents.on("did-finish-load", () => {
        RegisterShortcuts(win);

        if (store.get("maximized") === true) win.maximize();
        else win.setSize(store.get("width"), store.get("height"));

        win.show();
    });

    win.on("maximize", function (e) {
        win.webContents.send("maximize");
    });

    win.on("unmaximize", function (e) {
        win.webContents.send("unmaximize");
    });

    win.on("page-title-updated", function (e, title) {
        win.webContents.send("page-title-updated", title);
    });

    win.on("crashed", function (e) {
        dialog.showMessageBox({
            title: "Erro",
            type: "error",
            message: "A janela foi terminada inesperadamente!",
        });
    });

    win.on("close", function (e) {
        const bounds = win.getBounds();

        store.set("maximized", win.isMaximized());
        store.set("width", bounds.width);
        store.set("height", bounds.height);

        app.exit();
    });

    win.loadFile("assets/pages/login/index.html");

    return win;
}