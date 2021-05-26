const { app, BrowserWindow } = require("electron");
const App = require("./src/App");

if (process.env.NODE_ENV === "development") {
    require('electron-reload')(__dirname, {
        electron: require(`${__dirname}/node_modules/electron`),
        hardResetMethod: "exit"
    });
}

app.setAppUserModelId("poppedidos.com.br");
app.commandLine.appendSwitch('disable-site-isolation-trials')

app.whenReady().then(App);

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) App();
})

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
})