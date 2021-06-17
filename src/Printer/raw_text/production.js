const { GetWindow } = require("../../Offscreen");
const { RenderInWindow } = require("../../Offscreen/Templates");
const { PrintWindow } = require("../utils");

module.exports = (printer, order, company) => {
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

        try {
            await RenderInWindow(win, "printing:raw_text:production", { printer, order, company });
            await PrintWindow(win, printer?.device);
            resolve();
        } catch (ex) {
            reject(ex);
        } finally {
            if (!win.isDestroyed() && process.env.NODE_ENV !== "development") win.destroy();
            
            delete win;
        }
    });
}