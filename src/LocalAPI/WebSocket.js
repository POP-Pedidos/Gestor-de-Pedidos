const authentication = require("./Authentication");

module.exports = function ({ wss, sockets, server }) {
    wss.on("connection", function (socket) {
        sockets.add(socket);

        socket.on("message", function (message) {
            try {
                const [event, data] = JSON.parse(message);

                if (event === "whatsapp:sendMessage") {
                    win.webContents.send("whatsapp:sendMessage", data.number, data.message);
                }
            } catch {
                socket.destroy();
                sockets.delete(socket);
            }
        });

        socket.on("error", console.error);

        socket.once("close", () => {
            sockets.delete(socket);
        });
    });

    server.on("upgrade", function upgrade(request, socket, head) {
        const token = request.headers.authorization?.replace("Bearer", "").trim();

        if (token && authentication.validate(token)) {
            ws.handleUpgrade(request, socket, head, (ws) => {
                ws.emit("connection", ws, request);
            });
        } else {
            socket.write('HTTP/1.1 401 Unauthorized\r\n\r\n');
            socket.destroy();
            return;
        }
    });
}