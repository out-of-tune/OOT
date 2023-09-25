module.exports = {
    PROXY_URI: process.env.VUE_APP_PROXY_ENV,
    isProd: process.env.NODE_ENV === "production"
}