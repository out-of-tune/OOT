module.exports = {
  publicPath: "/app/",
  configureWebpack: {
    resolve: {
      fallback: {
        "fs": false,
        "tls": false,
        "net": false,
        "path": false,
        "zlib": false,
        "http": false,
        "https": false,
        "stream": false,
        "crypto": false,
        "url": false
      }
    }
  }
}
