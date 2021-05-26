const { app } = require('electron');
const path = require('path');
const fs = require('fs');

class Store {
    constructor(name, defaults = {}) {
        if (!name || typeof name !== "string") throw new Error("missing name");
        if (!defaults || typeof defaults !== "object") throw new Error("missing default data");

        this.user_data_path = app.getPath("userData");
        this.config_data_path = path.join(this.user_data_path, "Config");

        if (!fs.existsSync(this.user_data_path)) fs.mkdirSync(this.user_data_path);
        if (!fs.existsSync(this.config_data_path)) fs.mkdirSync(this.config_data_path);

        this.defaults = defaults;
        this.file_name = `${name}.json`;
        this.file_path = path.join(this.config_data_path, this.file_name);
        this.data = parseDataFile(this.file_path, this.defaults);
    }

    get(key) {
        return this.data[key];
    }

    set(key, val) {
        this.data[key] = val;
        fs.writeFileSync(this.file_path, JSON.stringify(this.data, null, 2));
    }
}

function parseDataFile(filePath, defaults) {
    try {
        return JSON.parse(fs.readFileSync(filePath));
    } catch (error) {
        return defaults;
    }
}

module.exports = Store;