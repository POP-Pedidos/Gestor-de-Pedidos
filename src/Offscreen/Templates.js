const ejs = require("ejs");
const fs = require("fs");
const path = require("path");
const { app } = require('electron');

const utils = require("./Utils.js");
const config = require("../../config");

const templates = {
    "product": "assets/templates/thumbnails/product.ejs",
    "company": "assets/templates/thumbnails/company.ejs",
    "orders": "assets/templates/orders.ejs",
    "printing:graphics:control": "assets/templates/printing/graphics/control.ejs",
    "printing:graphics:delivery": "assets/templates/printing/graphics/delivery.ejs",
    "printing:graphics:production": "assets/templates/printing/graphics/production.ejs",
    "printing:raw_text:control": "assets/templates/printing/raw_text/control.ejs",
    "printing:raw_text:delivery": "assets/templates/printing/raw_text/delivery.ejs",
    "printing:raw_text:production": "assets/templates/printing/raw_text/production.ejs",
}

const appPath = app.getAppPath();

const templates_html_cache = {};

function GetTemplateHTML(template) {
    try {
        const file = templates[template];
        if (!file) return null;
        const file_path = path.join(appPath, file);

        if (process.env.NODE_ENV !== "development" && templates_html_cache[template]) return templates_html_cache[template];

        const html = fs.readFileSync(file_path, "utf8");
        templates_html_cache[template] = html;

        return html;
    } catch {
        return null;
    }
}

function Render(template, options) {
    try {
        const rendered_html = ejs.render(GetTemplateHTML(template), {
            appPath: appPath.replace(/\\/g, "/"),
            ...utils,
            ...config,
            ...options,
        });

        return rendered_html;
    } catch (ex) {
        console.error(ex);
        return null;
    }
}

function RenderInWindow(win, template, options) {
    return new Promise(async (resolve, reject) => {
        try {
            let html = Render(template, options);

            if (!html) {
                reject("cannot render template");
            } else {
                win.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(html)}`);
                delete html;
                resolve();
            }
        } catch (ex) {
            reject(ex);
        }
    });
}

module.exports = { Render, RenderInWindow }