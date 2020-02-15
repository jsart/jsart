const path = require('path')
module.exports = {
  develop: 'src',
  output: {
    path: 'dist',
    assetsPath: 'assets',
    assetsList: 'manifest'
  },
  // useCssPre: 'less',
  devServer: {
    hotDelay: 500,
    port: 8082,
    host: '192.168.123.25'
  }
}
