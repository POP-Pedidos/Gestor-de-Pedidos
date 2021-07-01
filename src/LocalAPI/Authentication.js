const os = require("os");
const uuid = require("uuid");
const fetch = require("node-fetch");

const Hostname = os.userInfo().username;
const tokens = [];

function login(username, password) {
    return new Promise(async (resolve, reject) => {
        if (!username) return reject("missing username");
        if (!password) return reject("missing password");

        fetch("https://api.poppedidos.com.br/user/login", {
            method: "POST",
            headers: { "Content-Type": "application/json", Hostname },
            body: JSON.stringify({ username, password }),
        }).then(res => res.json()).then(data => {
            if (data.success === true) {
                const token = uuid.v4();

                tokens.push(token);
                resolve(token);
            } else reject(data.error);
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