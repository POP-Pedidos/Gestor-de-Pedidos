function PrintWindow(win, printer_name) {
    return new Promise((resolve, reject) => {
        function Print() {
            const printerDevice = win.webContents.getPrinters().find(device => device.name === printer_name);

            win.webContents.print({
                deviceName: printerDevice?.name.startsWith("\\\\") ? undefined : printerDevice?.name,
                silent: !!printerDevice && !printerDevice.name.startsWith("\\\\"),
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