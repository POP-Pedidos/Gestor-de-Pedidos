const express = require("express");
const router = express.Router();
const authenticate = require("../middlewares/authentication");

router.post("/message", authenticate, async function (req, res) {
    const { number, message } = req.body;
    if (!number) return res.status(400).json({ error: "missing number" });
    if (!message) return res.status(400).json({ error: "missing message" });

    const status = await win.webContents.send("whatsapp:sendMessage", number, message);

    res.sendStatus(status ? 200 : 500);
});

module.exports = router;