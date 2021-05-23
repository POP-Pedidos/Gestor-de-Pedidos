const { globalShortcut } = require("electron");

module.exports = function CreateShortcuts(win) {
    globalShortcut.register('CommandOrControl+Shift+I', () => {
        win.webContents.toggleDevTools();
    })
}