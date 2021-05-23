const CreateWindow = require("./CreateWindow");
const RegisterShortcuts = require("./RegisterShortcuts");
const IpcMain = require("./IpcMain");

module.exports = function App() {
    const win = CreateWindow();

    RegisterShortcuts(win);
}