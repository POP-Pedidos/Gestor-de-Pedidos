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
    "printing:control": "assets/templates/printing/control.ejs",
    "printing:delivery": "assets/templates/printing/delivery.ejs",
    "printing:production": "assets/templates/printing/production.ejs",
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
    } catch {
        return null;
    }
}

module.exports = { Render }