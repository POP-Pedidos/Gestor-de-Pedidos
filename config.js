const is_dev = process.env.NODE_ENV === "development";

module.exports = {
    portal_url: is_dev ? "http://localhost:88" : "https://portal.poppedidos.com.br"
}