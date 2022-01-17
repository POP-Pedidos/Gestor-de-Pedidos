const express = require("express");
const router = express.Router();
const authenticate = require("../middlewares/authentication");
const authentication = require("../../Authentication");

router.post("/authenticate", function (req, res) {
    try {
        if (req.body?.username !== req.localUsername) return res.status(400).json({ error: "invalid username" });

        authentication.login(req.body?.username, req.body?.password).then(data => {
            res.json({ ...data, whatsapp_number: global.whatsapp_number });
        }).catch(error => {
            if (error instanceof Error) {
                console.error(error)
                res.status(500).json({ error: "Internal Server Error" })
            } else {
                res.status(400).json({ error })
            }
        });
    } catch (error) {
        res.status(500).json({ error });
    }
});

router.post("/validate", authenticate, function (req, res) {
    res.sendStatus(200);
});

module.exports = router;