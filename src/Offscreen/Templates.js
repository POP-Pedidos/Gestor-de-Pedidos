const ejs = require("ejs");
const fs = require("fs");
const utils = require("./Utils.js");
const config = require("../../config");

const templates = {
    "product": "assets/templates/thumbnails/product.ejs",
    "company": "assets/templates/thumbnails/company.ejs",
    "orders": "assets/templates/orders.ejs",
    "printing:control": "assets/templates/printing/control.ejs",
}

const templates_html_cache = {};

function GetTemplateHTML(template) {
    try {
        const file = templates[template];
        if (!file) return null;

        if (process.env.NODE_ENV !== "development" && templates_html_cache[template]) return templates_html_cache[template];

        const html = fs.readFileSync(file, "utf8");
        templates_html_cache[template] = html;

        return html;
    } catch {
        return null;
    }
}

function Render(template, options) {
    const rendered_html = ejs.render(GetTemplateHTML(template), {
        __dirname: __dirname.replace(/\\/g, "/"), 
        ...utils,
        ...config,
        ...options,
    });

    return rendered_html;
}

module.exports = { Render }