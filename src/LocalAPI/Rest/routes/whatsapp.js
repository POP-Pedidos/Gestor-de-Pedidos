const express = require("express");
const router = express.Router();
const authenticate = require("../middlewares/authentication");
const { ipcMain } = require('electron')

router.post("/message", authenticate, async function (req, res) {
    try {
        const { number, message } = req.body;

        if (!number) return res.status(400).json({ error: "missing number" });
        if (!message) return res.status(400).json({ error: "missing message" });
        if (!global.whatsapp_number) return res.status(422).json({ error: "whatsapp not ready" });
    
        const responseChannelId = String(Math.random()).replace(".", "");
        let responseChannelTimeout;
    
        const responseFunction = (event, response, error) => {
            clearTimeout(responseChannelTimeout);
            if (error) res.status(500).json({ error });
            else res.sendStatus(200);
        };
    
        responseChannelTimeout = setTimeout(() => {
            ipcMain.off(responseChannelId, responseFunction);
            res.status(408).json({ error: "response channel timeout" });
        }, 3000);
    
        win.webContents.send("whatsapp:sendMessage", responseChannelId, number, message);
    
        ipcMain.once(responseChannelId, responseFunction);
    } catch (error) {
        res.status(500).json({ error });
    }
});

router.get("/order/:id_order", authenticate, async function (req, res) {
    try {
        if (!req.params.id_order || isNaN(req.params.id_order)) return res.status(400).json({ error: "missing id_order" });
        if (!global.whatsapp_number) return res.status(422).json({ error: "whatsapp not ready" });
    
        const responseChannelId = String(Math.random()).replace(".", "");
        const responseChannelTimeout = setTimeout(() => {
            ipcMain.off(responseChannelId);
            res.status(408).json({ error: "response channel timeout" });
        }, 30000);
    
        win.webContents.send("whatsapp:sendOrderMessage", responseChannelId, req.params.id_order);
    
        ipcMain.once(responseChannelId, (event, response, error) => {
            clearTimeout(responseChannelTimeout);
            if (error) res.status(500).json({ error });
            else res.sendStatus(200);
        });
    } catch (error) {
        res.status(500).json({ error });
    }
});

module.exports = router;