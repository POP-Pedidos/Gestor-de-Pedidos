const { globalShortcut } = require("electron");

module.exports = function CreateShortcuts(win) {
    globalShortcut.register('CommandOrControl+Shift+I', () => {
        win.webContents.toggleDevTools();
    });

    globalShortcut.register('Alt+CommandOrControl+Shift+I', () => {
        win.webContents.executeJavaScript(`if(!!whatsappWebView) whatsappWebView.isDevToolsOpened() ? whatsappWebView.closeDevTools() : whatsappWebView.openDevTools();`);
    });
}