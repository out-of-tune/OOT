module.exports = {
    PROXY_URI: process.env.VUE_APP_PROXY_URI,
    isProd: process.env.NODE_ENV === "production"
}