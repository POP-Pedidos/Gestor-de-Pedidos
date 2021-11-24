const express = require("express");
const router = express.Router();
const authenticate = require("../middlewares/authentication");
const authentication = require("../../Authentication");

router.post("/authenticate", function (req, res) {
    authentication.login(req.body?.username, req.body?.password).then(token => {
        res.json({ token, whatsapp_number: global.whatsapp_number });
    }).catch(error => {
        if (error instanceof Error) {
            console.error(error)
            res.status(500).json({ error: "Internal Server Error" })
        } else {
            res.status(400).json({ error })
        }
    });
});

router.post("/validate", authenticate, function (req, res) {
    res.sendStatus(200);
});

module.exports = router;