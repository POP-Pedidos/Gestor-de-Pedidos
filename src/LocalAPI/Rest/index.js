module.exports = function ({ app }) {
    app.use("/session", require("./routes/session"));
    app.use("/whatsapp", require("./routes/whatsapp"));
}