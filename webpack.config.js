const path = require('path')

module.exports = {
  mode: 'production',
  entry: {
    main: './js/main.js',
    worker: './js/worker.js',
  },
  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, 'dist'),
  },
  optimization: {
    minimize: true,
  },
}