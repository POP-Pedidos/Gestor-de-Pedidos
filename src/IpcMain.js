const { ipcMain, BrowserWindow } = require('electron');
const { domain, api_url, places_url } = require("../config");
const os = require('os');

ipcMain.on('asynchronous-message', (event, arg) => {
    event.reply('asynchronous-reply', 'pong')
})

ipcMain.on('api_url', (event, arg) => {
    event.returnValue = api_url;
});

ipcMain.on('places_url', (event, arg) => {
    event.returnValue = places_url;
});

ipcMain.on('domain', (event, arg) => {
    event.returnValue = domain;
});

ipcMain.on('username', (event, arg) => {
    event.returnValue = os.userInfo().username;
});

ipcMain.on('printers', (event, arg) => {
    const win = BrowserWindow.getFocusedWindow();

    event.returnValue = win.webContents.getPrinters()?.map(printer => printer.name || printer.displayName);

    // win.webContents.print(options, (success, failureReason) => {
    //     if (!success) console.log(failureReason);
  
    //     console.log('Print Initiated');
    // });
});

module.exports = ipcMain;