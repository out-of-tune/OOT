module.exports = {
    PROXY_URI: process.env.VUE_APP_PROXY_URI,
    APP_MOUNT_PATH: process.env.VUE_APP_MOUNT_PATH || '/',
    isProd: process.env.NODE_ENV === "production"
}