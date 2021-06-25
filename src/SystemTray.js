const { app, Menu, Tray } = require('electron');
const Icons = require('./Icons');

module.exports = function CreateTray() {
    const tray = new Tray(Icons.default);

    function openOrders() {
        win.webContents.send("tab:change", "pedidos");
        win.show();
        win.focus();
    }

    function openProducts() {
        win.webContents.send("tab:change", "cadastros_produtos");
        win.show();
        win.focus();
    }

    function openCompany() {
        win.webContents.send("tab:change", "configuracoes_empresa");
        win.show();
        win.focus();
    }

    function openWhatsApp() {
        win.webContents.send("tab:change", "whatsapp");
        win.show();
        win.focus();
    }

    function disconnect() {
        win.webContents.send("user:disconnect");
        win.show();
        win.focus();
    }

    function disconnectWhatsApp() {
        win.webContents.send("whatsapp:disconnect");
        win.show();
        win.focus();
    }

    function close() {
        app.close();
    }

    const contextMenu = Menu.buildFromTemplate([
        { label: "Pedidos", type: "normal", click: openOrders },
        { label: "Produtos", type: "normal", click: openProducts },
        { label: "Empresa", type: "normal", click: openCompany },
        { label: "WhatsApp", type: "normal", click: openWhatsApp },
        { type: "separator" },
        { label: "Desconectar", type: "normal", click: disconnect },
        { label: "Desconectar WhatsApp ", type: "normal", click: disconnectWhatsApp },
        { type: "separator" },
        { label: "Fechar", type: "normal", click: close },
    ]);

    tray.on("click", function (e) {
        win.show();
        win.focus();
    });

    tray.setToolTip("Gestor de pedidos");
    tray.setIgnoreDoubleClickEvents(true);
    tray.setContextMenu(contextMenu);

    tray.setIcon = (icon) => {
        tray.setImage(icon);
        tray.setContextMenu(contextMenu);
    }

    return tray;
}