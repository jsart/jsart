// 开发热更新服务器逻辑

const path = require('path')
const chalk = require('chalk')
const express = require('express')
const webpack = require('webpack')
const webpackDevMiddleware = require('webpack-dev-middleware')
const webpackHotMiddleware = require('webpack-hot-middleware')
const webpackConfig = require('./webpack.config')
const devRoute = require('./dev.route.js')

const log = console.log
const outPath = webpackConfig.output.path
const publicPath = webpackConfig.output.publicPath
const host = webpackConfig.devServer.host
const port = webpackConfig.devServer.port

const app = express()
const compiler = webpack(webpackConfig)

// 开发中间件
let devMiddleware = webpackDevMiddleware(compiler, {
  publicPath: publicPath,
  quiet: true // 向控制台显示任何内容
})
app.use(devMiddleware)

// 模块热更新中间件
let hotMiddleware = webpackHotMiddleware(compiler, {
  log: false,
  heartbeat: 2000,
})
app.use(hotMiddleware)

// 加载静态内容
app.use(express.static(outPath))

// 创建开发路由
devRoute.forEach(route => {
  app.get(route.path, (req, res, next) => {
    const filename = path.join(outPath, route.views + '.html');
    compiler.outputFileSystem.readFile(filename, (err, result) => {
      if (err) return (next(err))
      res.set('content-type', 'text/html')
      res.send(result)
      res.end()
    })
  })
  log(chalk.green('[WebsiteBuilderTools] - 路由创建成功！'))
});

app.listen(port)

// webpack 编译提示
let timer

function webpackCompilerTip() {
  // webpack编译成功后执行
  this.hooks.done.tap('reloadSuccess', function () {
    if (timer) clearTimeout(timer)
    timer = setTimeout(function () {
      log(chalk.green('[WebsiteBuilderTools] - 模块热更新，重编译成功！地址：'))
      log(chalk.yellow('http://localhost:' + port))
      if (host && host !== '0.0.0.0') {
        log(chalk.yellow('http://' + host + ':' + port))
      }
      timer = null
    }, 500)
  })

  // webpack编译失败后执行
  this.hooks.failed.tap('reloadFaile', function () {
    log(chalk.red('[WebsiteBuilderTools] - 模块热更新，重编译失败，详细原因请查看打印日志。'))
  })
}

// 监听webpack执行
webpackCompilerTip.call(compiler)

// webpack监听模式下，一个新的编译(compilation)触发之后
compiler.hooks.watchRun.tap('compileSuccess', compilation => {
  webpackCompilerTip.call(compilation)
})
