const { app, Menu, Tray } = require('electron');
const Icons = require('./Icons');

module.exports = function CreateTray(options = {}) {
    const tray = new Tray(Icons.default);

    function showAndFocusWindow() {
        if (win.isMinimized()) win.restore();
        else win.show();

        win.focus();
    }

    function openOrders() {
        win.webContents.executeJavaScript(`$("a[for_panel=\\"pedidos\\"]").click()`);
        showAndFocusWindow();
    }

    function openProducts() {
        win.webContents.executeJavaScript(`$("a[for_panel=\\"cadastros_produtos\\"]").click()`);
        showAndFocusWindow();
    }

    function openCompany() {
        win.webContents.executeJavaScript(`$("a[for_panel=\\"configuracoes_empresa\\"]").click()`);
        showAndFocusWindow();
    }

    function openWhatsApp() {
        win.webContents.executeJavaScript(`$("a[for_panel=\\"whatsapp\\"]").click()`);
        showAndFocusWindow();
    }

    function disconnect() {
        win.webContents.executeJavaScript(`logout()`);
        showAndFocusWindow();
    }

    function disconnectWhatsApp() {
        win.webContents.executeJavaScript(`$("a[for_panel=\\"whatsapp\\"]").click()`);
        win.webContents.executeJavaScript(`whatsappWebView.send("logout")`);
        showAndFocusWindow();
    }

    function close() {
        app.close();
    }

    let contextMenu;

    tray.on("click", function (e) {
        showAndFocusWindow();
    });

    tray.loadContextMenu = (options = {}) => {
        console.log(options)
        const menu_options = [
            { label: "Pedidos", type: "normal", click: openOrders },
            { label: "Produtos", type: "normal", click: openProducts },
            { label: "Empresa", type: "normal", click: openCompany },
            { label: "WhatsApp", type: "normal", click: openWhatsApp },
            { type: "separator" },
            { label: "Desconectar", type: "normal", click: disconnect },
            !!options.disconnect_whatsapp && { label: "Desconectar WhatsApp ", type: "normal", click: disconnectWhatsApp },
            { type: "separator" },
            { label: "Fechar", type: "normal", click: close }
        ];

        contextMenu = Menu.buildFromTemplate(menu_options.filter(opt => !!opt));
        tray.setContextMenu(contextMenu);
    }

    tray.setIcon = (icon) => {
        tray.setImage(icon);
        tray.setContextMenu(contextMenu);
    }

    tray.setToolTip("Gestor de pedidos");
    tray.setIgnoreDoubleClickEvents(true);
    tray.loadContextMenu(options);

    return tray;
}