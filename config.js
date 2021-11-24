const is_dev = process.env.NODE_ENV === "development";

module.exports = {
    portal_url: is_dev ? "http://localhost:88" : "https://portal.poppedidos.com.br",
    api_url: is_dev ? "http://localhost:2000" : "https://api.poppedidos.com.br",
}