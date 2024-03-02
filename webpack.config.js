const path = require('path')

module.exports = {
  mode: 'production',
  entry: {
    main: './js/ts/main.js',
    worker: './js/ts/worker.js',
  },
  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, 'dist'),
  },
  optimization: {
    minimize: true,
  },
}