require("babel-polyfill");

module.exports = {
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
