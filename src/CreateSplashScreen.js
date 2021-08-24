const { BrowserWindow } = require("electron");

const Icons = require("./Icons");

module.exports = function CreateSplashScreen() {
    const win = new BrowserWindow({
        title: "POP Pedidos",
        icon: Icons.default,
        width: 500,
        height: 250,
        titleBarStyle: "hidden",
        maximizable: false,
        minimizable: false,
        show: !process.argv.includes("--hidden"),
        transparent: true, 
        frame: false,
        hasShadow: true,
    });

    win.once("crashed", function (e) {
        dialog.showMessageBox({
            title: "Erro",
            type: "error",
            message: "A janela foi terminada inesperadamente!",
        });
    });

    win.loadFile("assets/loading.html");

    return win;
}