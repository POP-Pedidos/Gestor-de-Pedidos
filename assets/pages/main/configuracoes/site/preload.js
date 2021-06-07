let { ipcRenderer } = require("electron");

ipcRenderer.on("setCompanyIcon", (e, src) => {
    document.querySelectorAll("img[company-icon]").forEach(elem => elem.src = src);
});

ipcRenderer.on("setBGImage", (e, src) => {
    document.querySelector("body>header>.bg").style.backgroundImage = src;
});

ipcRenderer.on("setStyleProperty", (e, name, value) => {
    document.documentElement.style.setProperty(name, value);
});