require("babel-polyfill");

module.exports = {
    publicPath: "/app/",
    css: {
      extract: false
    },
    configureWebpack: {
      devtool: 'source-map',
      entry: ["babel-polyfill", "./src/main.js"],
      optimization: {
        splitChunks: {
            chunks: 'all'
        }
      }
    }
  }
