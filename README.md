# jsart

原 `WebsiteBuilderTools2.0` 版本
前端静态页面模块化编写工具，基于 `art` 模板引擎实现模块化编写前端静态页面，可自动打包引入的 js、css、img 等文件，自动修改静态资源路径，添加 `hash` 值。开发支持实时热更新。

## 需要技术

> 使用该工具前，你需要掌握以下技术栈

- [art-template](http://aui.github.io/art-template/)

## 文件结构说明

- dist ——构建输出目录
- gulpfile.js ——gulp 构建任务
- manifest ——gulp-rev 生成的静态资源清单
- src ——开发工作目录
  - assets ——静态资源目录
  - component ——art 小布局组件建议存放目录
  - data ——art 数据存放目录
  - pages ——视图 art 存放目录
- config.js ——jsart 工具相关配置

## Config

```
const path = require('path')
module.exports = {
  develop: 'src', // 开发工作目录
  output: {
    path: 'dist', // 构建输出目录
    /**
     * 静态资源目录
     * 构建输出时，相对于构建输出目录，即：``dist/assets``
     * 构建查找源时，相对于开发工作目录，即：``src/assets``
     * 因此请一一对应，避免不必要的错误
     */
    assetsPath: 'assets',
    assetsList: 'manifest' // gulp-rev 生成的静态资源清单目录
  },
  useCssPre: 'less', // 使用预编译模式，如不使用可不填写
  devServer: {
    hotDelay: 500, // 热更新延迟毫秒数
    port: 8082, // 服务端口
    host: '192.168.123.25' // 服务host，默认为'localhost'
  }
}
```

> 更多 `devServer` 服务配置请移步 [gulp-connect](https://github.com/avevlad/gulp-connect#api) 查阅。

## 使用教程

- Clone or download
- 安装依赖 `npm i`
- 构建打包 `npm build`
- 开发调试 `npm dev`
- 在 'src/assets/css' 中编写样式文件，可以使用预编译，默认已集成 less 与 sass，在 config 中配置即可
- 在 'src/assets/js' 中编写脚本文件，可以使用 ES6 语法，已经集成了 Babel 7
- 在 'src/assets/img' 中放入站点需要的图片
- 在 'src/component' 中写入 `art` 布局组件，如`header` `footer` `layout` 等
- 在 'src/data' 中写入 `art data` 数据
- 在 'src/pages' 中写入 `art` 视图，这里 `jsart` 为 `art` 视图文件增加了通过`<import_art_data src="../data" />`方式引入 art 模板数据的语法，因此你可以轻松为不同的`art` 视图引入不同的数据（注：请不要在`art` 布局组件中使用该语法）

## jsart-cli 开发中......
