const { APP_MOUNT_PATH } = require("./src/settings");

module.exports = {
  publicPath: APP_MOUNT_PATH,
  configureWebpack: {
    resolve: {
      fallback: {
        fs: false,
        tls: false,
        net: false,
        path: false,
        zlib: false,
        http: false,
        https: false,
        stream: false,
        crypto: false,
        url: false,
      },
    },
  },
};
