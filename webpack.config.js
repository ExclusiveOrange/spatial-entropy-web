const path = require('path')

module.exports = {
  mode: 'production',
  entry: {
    main: './js/main.js',
  },
  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, 'dist'),
  },
  optimization: {
    minimize: true,
  },
}