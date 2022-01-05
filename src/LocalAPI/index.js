const http = require("http");
const express = require("express");
const WebSocket = require("ws");

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server, path: "/" });

const sockets = new Set();

app.use(express.json());

app.use((req, res, next) => {
    req.localUsername = server.localUsername;
    next();
});

require("./Rest")({ server, app, sockets, wss });
require("./WebSocket")({ server, app, sockets, wss });

function listen(username) {
    server.localUsername = username;
    if (!server.listening) server.listen(4466, "localhost");
}

function close() {
    for (const socket of sockets) {
        socket.destroy();

        sockets.delete(socket);
    }

    server.localUsername = null;
    server.close();
}

function socketsBroadcast(event, data) {
    for (const socket of sockets) {
        socket.send(JSON.stringify([event, data]));
    }
}

module.exports = {
    listen,
    close,
    socketsBroadcast,
}