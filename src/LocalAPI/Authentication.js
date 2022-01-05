const os = require("os");
const uuid = require("uuid");
const fetch = require("node-fetch");
const { api_url } = require("../../config");

const Hostname = os.userInfo().username;
const tokens = [];

function login(username, password) {
    return new Promise(async (resolve, reject) => {
        if (!username) return reject("missing username");
        if (!password) return reject("missing password");

        fetch(`${api_url}/user/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json", Hostname },
            body: JSON.stringify({ username, password }),
        }).then(res => res.json()).then(data => {
            if (data.success == false) return reject(data.error);

            fetch(`${api_url}/company`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${data.data.token}`
                },
                body: JSON.stringify({ integrated: true }),
            }).then(res => res.json()).then(data => {
                win.webContents.send("local_api:integrated");
                const token = uuid.v4();
                tokens.push(token);

                resolve({ token, company: data.data });
            }).catch(reject);
        }).catch(reject);
    });
}

function validate(token) {
    return tokens.includes(token);
}

function clearTokens() {
    tokens.splice(0, tokens.length);
}

module.exports = {
    login,
    validate,
    clearTokens
}