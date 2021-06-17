const { globalShortcut, dialog, app } = require("electron");

module.exports = function CreateShortcuts(win) {
    globalShortcut.register("CommandOrControl+Shift+I", () => {
        if (win.isFocused()) win.webContents.toggleDevTools();
    });

    globalShortcut.register("CommandOrControl+Shift+R", () => {
        if (win.isFocused()) win.webContents.reload();
    });

    globalShortcut.register("Alt+CommandOrControl+Shift+I", () => {
        if (win.isFocused()) win.webContents.executeJavaScript(`if(window.whatsappWebView) whatsappWebView.isDevToolsOpened() ? whatsappWebView.closeDevTools() : whatsappWebView.openDevTools();`);
    });

    globalShortcut.register("Alt+CommandOrControl+Shift+H", () => {
        if (win.isFocused()) dialog.showMessageBox(win, {
            type: "info",
            title: `About ${app.getName()}`,
            message: `Environment: ${require('os').arch()}\nVersion: ${app.getVersion()}\nElectron: ${process.versions["electron"]}\nChrome: ${process.versions["chrome"]}\nNode: ${process.versions["node"]}\nV8: ${process.versions["v8"]}`
        });
    });
}