const { BrowserWindow } = require("electron");
const fs = require("fs");
const os = require("os");
const ptp = require("pdf-to-printer");
const { v4: UUIDv4 } = require("uuid");

const templates = require("./Templates");

function GetWindow(options = {}) {
    const win = new BrowserWindow({
        show: false,
        javascript: false,
        webPreferences: {
            offscreen: true
        },
        ...options,
    });

    win.webContents.setFrameRate(30);

    return win;
}

function WaitAllResourcesToLoad(win) {
    return new Promise((resolve, reject) => {
        const timeout = setTimeout(() => reject("timeout"), 60000);

        async function Check() {
            try {
                const response = await win.webContents.executeJavaScript(`Array.from(document.images).every((i) => i.complete)`);

                if (response === true) {
                    clearTimeout(timeout);
                    resolve();
                } else setTimeout(Check, 100);
            } catch (ex) {
                reject(ex);
            }
        }

        Check();
    });
}

function WaitFinishInWindow(win) {
    return new Promise((resolve, reject) => {
        const timeout = setTimeout(() => reject("timeout"), 60000);

        async function Check() {
            try {
                const response = await win.webContents.executeJavaScript(`window.finished`);

                if (response === true) {
                    clearTimeout(timeout);
                    resolve();
                } else setTimeout(Check, 100);
            } catch (ex) {
                reject(ex);
            }
        }

        Check();
    });
}

function generateProductThumbnail(data) {
    return new Promise(async (resolve, reject) => {
        let win = GetWindow({ width: 1200, height: 630 });
        let html = templates.Render("product", { ...data });

        if (!html) {
            win.close();
            delete win;
            return reject("cannot render template");
        }

        win.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(html)}`);

        win.webContents.on("did-stop-loading", async () => {
            await WaitAllResourcesToLoad(win);

            win.webContents.capturePage()
                .then(image => resolve(image.toDataURL()))
                .catch(reject)
                .finally(() => {
                    win.close();

                    delete win;
                    delete html;
                });
        });
    });
}

function generateOrdersHTMLReport(file_path, data) {
    return new Promise(async (resolve, reject) => {
        let win = GetWindow({ javascript: true, width: 1, height: 1 });
        let html = templates.Render("orders", { ...data });

        if (!html) {
            win.close();
            delete win;
            return reject("cannot render template");
        }

        win.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(html)}`);

        win.webContents.on("did-stop-loading", async () => {
            await WaitFinishInWindow(win);

            const page_html = await win.webContents.executeJavaScript(`document.documentElement.outerHTML`);

            try {
                fs.writeFileSync(file_path, page_html);
                resolve();
            } catch (ex) {
                reject(ex);
            } finally {
                win.close();

                delete win;
                delete html;
            }
        });
    });
}

function printControlCopy(printer, order, company) {
    return new Promise(async (resolve, reject) => {
        let win = GetWindow({
            show: process.env.NODE_ENV === "development",
            javascript: false,
            webPreferences: {
                offscreen: process.env.NODE_ENV !== "development",
                webSecurity: false,
            },
            width: (printer?.size || 58) * 5,
        });

        let html = templates.Render("printing:control", { printer, order, company });

        if (!html) {
            win.close();
            delete win;
            return reject("cannot render template");
        }

        win.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(html)}`);

        win.webContents.on("did-stop-loading", async () => {
            PrintWindow(win, printer?.device);
        });
    });
}

function printDeliveryCopy(printer, order, company) {
    return new Promise(async (resolve, reject) => {
        let win = GetWindow({
            show: process.env.NODE_ENV === "development",
            javascript: false,
            webPreferences: {
                offscreen: process.env.NODE_ENV !== "development",
                webSecurity: false,
            },
            width: (printer?.size || 58) * 5,
        });

        let html = templates.Render("printing:delivery", { printer, order, company });

        if (!html) {
            win.close();
            delete win;
            return reject("cannot render template");
        }

        win.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(html)}`);

        win.webContents.on("did-stop-loading", async () => {
            PrintWindow(win, printer?.device);
        });
    });
}

function printProductionCopy(printer, order, company) {
    return new Promise(async (resolve, reject) => {
        let win = GetWindow({
            show: process.env.NODE_ENV === "development",
            javascript: false,
            webPreferences: {
                offscreen: process.env.NODE_ENV !== "development",
                webSecurity: false,
            },
            width: (printer?.size || 58) * 5,
        });

        let html = templates.Render("printing:production", { printer, order, company });

        if (!html) {
            win.close();
            delete win;
            return reject("cannot render template");
        }

        win.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(html)}`);

        win.webContents.on("did-stop-loading", async () => {
            PrintWindow(win, printer?.device);
        });
    });
}

function PrintWindow(win, printer_name) {
    return new Promise((resolve, reject) => {
        const printerDevice = win.webContents.getPrinters()?.find(device => device.name === printer_name);

        if(printerDevice) {
            const tempFilePath = `${os.tmpdir()}\\${UUIDv4()}.tmp`;
        
            win.webContents.printToPDF({ printBackground: true, landscape: true }).then(data => {
                fs.writeFileSync(tempFilePath, data);
    
                ptp.print(tempFilePath, { printer: printerDevice.name })
                .then(() => resolve())
                .catch(reject);
            })
        } else {
            win.webContents.print({
                silent: false,
                copies: 1,
            }, (success, failureReason) => {
                if (success) resolve();
                else reject(failureReason);
            });
        }
    })
}

module.exports = {
    GetWindow,
    generateProductThumbnail,
    generateOrdersHTMLReport,
    printControlCopy,
    printDeliveryCopy,
    printProductionCopy,
}