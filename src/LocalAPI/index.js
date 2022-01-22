const http = require("http");
const express = require("express");
const WebSocket = require("ws");
const morgan = require("morgan");

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server, path: "/" });

const sockets = new Set();

app.use(express.json());
app.use(morgan("dev"));

app.use((req, res, next) => {
    req.localUsername = server.localUsername;
    next();
});

require("./Rest")({ server, app, sockets, wss });

function listen(username) {
    if (!server.localUsername) server.listen(4466, "localhost");
    server.localUsername = username;
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