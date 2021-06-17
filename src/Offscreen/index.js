const { BrowserWindow } = require("electron");
const fs = require("fs");

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

module.exports = {
    GetWindow,
    generateProductThumbnail,
    generateOrdersHTMLReport,
}