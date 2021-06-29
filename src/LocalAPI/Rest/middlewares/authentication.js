const authentication = require("../../Authentication");

module.exports = (req, res, next) => {
    const token = req.headers.authorization?.replace("Bearer", "").trim();

    if (token) {
        if (authentication.validate(token)) next();
        else res.sendStatus(401);
    } else {
        res.sendStatus(401);
    }
}