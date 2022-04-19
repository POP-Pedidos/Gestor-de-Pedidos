function PrintWindow(win, printer_name) {
    return new Promise((resolve, reject) => {
        async function Print() {
            const printers = await win.webContents.getPrintersAsync();
            const printerDevice = printers.find(device => device.name === printer_name);

            win.webContents.print({
                deviceName: printerDevice?.name,
                silent: !!printerDevice,
                printBackground: true,
                copies: 1,
            }, (success, failureReason) => {
                if (success) resolve();
                else reject(failureReason);
            });
        }

        if (!win.webContents.isLoading() && !win.webContents.isDestroyed()) Print();
        else if (win.webContents.isLoading()) win.webContents.once("did-stop-loading", () => Print());
        else reject("window load error");
    })
}

module.exports = {
    PrintWindow,
}