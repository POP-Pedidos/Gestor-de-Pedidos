const http = require("http");
const express = require("express");
const WebSocket = require("ws");

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server, path: "/" });

const sockets = new Set();

app.use(express.json());

require("./Rest")({ server, app, sockets, wss });
require("./WebSocket")({ server, app, sockets, wss });

function listen(callback) {
    server.listen(4466, "localhost", callback);
}

function close(callback) {
    for (const socket of sockets) {
        socket.destroy();

        sockets.delete(socket);
    }

    server.close(callback);
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