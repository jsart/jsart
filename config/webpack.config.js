const path = require('path')
const {
  CleanWebpackPlugin
} = require('clean-webpack-plugin')
const webpack = require('webpack')
const MODE_TYPE = process.env.MODE_TYPE
const entry = MODE_TYPE === 'development' ? ['webpack-hot-middleware/client.js?reload=true', './src/main.js'] : './src/main.js'

module.exports = {
  mode: MODE_TYPE,
  entry: entry,
  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, './dist'),
    publicPath: '/assets/'
  },
  module: {
    rules: [{
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env']
          }
        }
      },
      {
        test: /\.(png|svg|jpg|gif)$/,
        use: [{
          loader: 'file-loader',
          options: {
            esModule: false
          },
        }]
      },
      {
        test: /\.arthtml$/,
        exclude: /node_modules/,
        use: [{
            loader: 'file-loader',
            options: {
              name: '[name].html'
            }
          },
          'extract-loader',
          {
            loader: 'html-loader',
            options: {
              attrs: ['img:src', 'link:href']
            }
          },
          'art-html-loader'
        ]
      }
    ]
  },
  devtool: 'inline-source-map',
  devServer: {
    host: '192.168.123.25',
    port: '8080',
    hot: true
  },
  plugins: [
    new CleanWebpackPlugin(),
    new webpack.NamedModulesPlugin(),
    new webpack.HotModuleReplacementPlugin()
  ]
}
