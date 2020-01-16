const path = require('path')
const {
  CleanWebpackPlugin
} = require('clean-webpack-plugin')
const webpack = require('webpack')
// const WebpackQcIconfontPlugin = require('iconfont-webpack-plugin')
const WebpackLayoutSimple = require('layout-simple-loader')

const layoutSimple = new WebpackLayoutSimple()
const MODE_TYPE = process.env.MODE_TYPE
const publicPath = '/assets/'
let entry = [layoutSimple.lessPath, layoutSimple.remJsPath, './src/main.js']
if (MODE_TYPE === 'development') {
  entry.push('webpack-hot-middleware/client.js?reload=true')
}

module.exports = {
  mode: MODE_TYPE,
  entry: entry,
  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, '../dist'),
    publicPath: publicPath
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
            esModule: false,
            name: '[name].[ext]',
            publicPath: MODE_TYPE === 'development' ? '' : '/images/',
            outputPath: MODE_TYPE === 'development' ? '' : '/images/'
          },
        }]
      },
      {
        test: /\.less$/,
        exclude: /node_modules/,
        use: [{
            loader: 'css-alone-loader',
            options: {
              esModule: false,
              name: '[name].css',
              publicPath: MODE_TYPE === 'development' ? '' : '/style/',
              outputPath: MODE_TYPE === 'development' ? '' : '/style/'
            }
          },
          {
            loader: 'postcss-loader',
            options: {
              plugins: [
                require('autoprefixer'),
                require('postcss-nested')
              ]
            }
          },
          'less-loader',
          {
            loader: layoutSimple.loaderLess,
            options: layoutSimple.options
          }
        ]
      },
      {
        test: /\.arthtml$/,
        exclude: /node_modules/,
        use: [{
            loader: 'file-loader',
            options: {
              esModule: false,
              name: '[name].html'
            }
          },
          {
            loader: require.resolve('../utils/htmlInsertLoader.js')
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
    // new WebpackQcIconfontPlugin({
    //   url: '//at.alicdn.com/t/font_xxxxxxx_xxxxxx.css',
    //   isDev: true,
    //   fontPath: './iconfont/iconfont',
    //   iconPrefix: '.cu-icon-',
    //   keepIconFontStyle: false,
    //   fontExt: ['.eot', '.ttf', '.svg', '.woff', '.woff2'],
    //   template: 'index.html'
    // }),
    new webpack.NamedModulesPlugin(),
    new webpack.HotModuleReplacementPlugin()
  ]
}
