const is_dev = process.env.NODE_ENV === "development";

module.exports = {
    domain: "poppedidos.com.br",
    api_url: is_dev ? "http://localhost:2000" : "https://api.poppedidos.com.br",
    places_url: is_dev ? "http://localhost:5000" : "https://places.poppedidos.com.br",
}