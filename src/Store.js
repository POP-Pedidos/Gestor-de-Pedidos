const { app } = require("electron");
const path = require("path");
const fs = require("fs");

let cache = null;

class Store {
    constructor(name, defaults = {}) {
        if (!name || typeof name !== "string") throw new Error("missing name");
        if (!defaults || typeof defaults !== "object") throw new Error("missing default data");

        this.user_data_path = app.getPath("userData");

        if (!fs.existsSync(this.user_data_path)) fs.mkdirSync(this.user_data_path);

        this.name = name;
        this.defaults = defaults;
        this.file_path = path.join(this.user_data_path, "app_config.json");
    }

    get(key) {
        if (!cache) cache = parseDataFile(this.file_path);

        return cache[this.name] ? cache[this.name][key] : this.defaults?.[key];
    }

    set(key, val) {
        if (!cache) cache = parseDataFile(this.file_path);

        if (cache[this.name]) cache[this.name][key] = val;
        else cache[this.name] = { [key]: val }

        fs.writeFileSync(this.file_path, JSON.stringify(cache, null, 2));
    }
}

function parseDataFile(filePath) {
    try {
        return JSON.parse(fs.readFileSync(filePath));
    } catch (error) {
        return {};
    }
}

module.exports = Store;