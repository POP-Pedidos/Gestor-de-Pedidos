const { globalShortcut } = require("electron");

module.exports = function CreateShortcuts(win) {
    globalShortcut.register("CommandOrControl+Shift+I", () => {
        if (win.isFocused()) win.webContents.toggleDevTools();
    });

    globalShortcut.register("Alt+CommandOrControl+Shift+I", () => {
        if (win.isFocused()) win.webContents.executeJavaScript(`if(window.whatsappWebView) whatsappWebView.isDevToolsOpened() ? whatsappWebView.closeDevTools() : whatsappWebView.openDevTools();`);
    });
}