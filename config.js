const is_dev = process.env.NODE_ENV === "development";

module.exports = {
    domain: "pop3.app",
    api_url: is_dev ? "http://localhost:2000" : "https://api.pop3.app",
    places_url: is_dev ? "http://localhost:5000" : "https://places.poppedidos.com.br",
}