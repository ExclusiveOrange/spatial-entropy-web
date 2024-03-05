const path = require('path')

module.exports = {
  mode: 'production',
  entry: {
    main: './js/ts/main/main.js',
    worker: './js/ts/worker/worker.js',
  },
  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, 'dist'),
  },
  optimization: {
    minimize: false,
    // minimize: true,
  },
}