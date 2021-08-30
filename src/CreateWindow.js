const { app, BrowserWindow, screen, shell, nativeTheme, dialog } = require("electron");
const { portal_url } = require("../config");
const path = require("path");

const Store = require("./Store");
const RegisterShortcuts = require("./RegisterShortcuts");
const Icons = require("./Icons");

module.exports = function CreateWindow() {
    const workAreaSize = screen.getPrimaryDisplay().workAreaSize

    let width = parseInt(workAreaSize.width / 1.3);
    let height = parseInt(workAreaSize.height / 1.3);
    if (width > height * 2) width = height * 2;

    const win = new BrowserWindow({
        title: "POP Pedidos",
        icon: Icons.default,
        width,
        height,
        minWidth: 960,
        minHeight: 600,
        titleBarStyle: "hidden",
        frame: false,
        show: false,
        hasShadow: true,
        webPreferences: {
            preload: path.join(__dirname, "./preload.js"),
            nodeIntegration: false,
            contextIsolation: false,
            enableRemoteModule: false,
            backgroundThrottling: false,
            webviewTag: true,
            nativeWindowOpen: true,
        },
    });

    const window_store = new Store("window", { width, height });
    const theme_store = new Store("dark-mode", { themeSource: "system" });
    const app_store = new Store("app", { backgroundRunning: false });

    nativeTheme.themeSource = theme_store.get("themeSource");

    win.removeMenu();

    win.webContents.setUserAgent(app.originalUserAgent);

    // win.webContents.setWindowOpenHandler(({ url }) => {
    //     try {
    //         setImmediate(() => shell.openExternal(url));
    //     } catch { }

    //     return { action: "deny" };
    // });

    win.webContents.on("new-window", function (e, url) {
        e.preventDefault();
        require("electron").shell.openExternal(url);
    });

    app.on("web-contents-created", function (e, contents) {
        if (contents.getType() === "webview") {
            contents.on("new-window", function (e, url) {
                e.preventDefault();
                require("electron").shell.openExternal(url);
            });
        }
    });

    win.webContents.on("did-finish-load", () => {
        RegisterShortcuts(win);

        if (window_store.get("maximized") !== true) {
            win.setSize(window_store.get("width"), window_store.get("height"));
        }

        if (!process.argv.includes("--hidden")) {
            if (window_store.get("maximized") === true) win.maximize();
            win.show();
        }
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
        if (app_store.get("backgroundRunning")) {
            e.preventDefault();
            win.hide();
        } else {
            if (tray && !tray.isDestroyed()) tray.destroy();
        }

        const bounds = win.getBounds();

        window_store.set("maximized", win.isMaximized());
        window_store.set("width", bounds.width);
        window_store.set("height", bounds.height);
    });

    win.loadURL(portal_url);

    return win;
}