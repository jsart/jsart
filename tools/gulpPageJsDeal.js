require('art-template')
const path = require('path')
const fs = require('fs')
const merge = require('merge')
const through2 = require('through2')
const gulpUtil = require('gulp-util')
const chalk = require('chalk')
const requireFromString = require('require-from-string')

const log = console.log
const ext = gulpUtil.replaceExtension
const PluginError = gulpUtil.PluginError
const pluginName = 'gulp-page-js-deal'
const propsFormat = {
  name: String, // 页面名称，必须
  styles: [String, Array], // 引用样式路径，可选
  template: Function, // art模板文件，必须
  data: Object, // art模板文件数据
  created: Function, // html页面创建时执行的js
  mounted: Function // html页面渲染完毕后执行的js
}
const defaultOptions = {
  develop: 'src', // 开发目录
  output: {
    path: 'dist', // 输出目录
    assetsPath: 'assets', // 静态文件目录
    assetsPrefix: './' // 静态文件路径前缀，例如用于相对路径与根路径的切换
  },
  dealMode: 'art', // 当前处理模式，分为art、css、js、img
  mode: 'development' // 当前模式 'development' or 'production'
}

/**
 * [Tools] *.jsart 文件返回数据格式检查
 * @param {Object} format 数据正确格式
 * @param {Object} data 需要检查的数据
 */
function propsTypes(format, data) {
  function typesString(fv, dv) {
    if (fv === String) return typeof dv !== 'string'
    return !(dv instanceof fv)
  }

  function typesArray(fv, dv) {
    const u = fv.reduce((lastR, s) => {
      const nowR = typesString(s, dv)
      return nowR && lastR
    }, true)
    return u
  }

  let errorKey
  const haveError = Object.keys(format).some(fk => {
    return Object.keys(data).some(dk => {
      if (dk === fk) {
        errorKey = dk
        const fv = format[fk]
        const dv = data[dk]
        if (fv instanceof Array) {
          return typesArray(fv, dv)
        }
        return typesString(fv, dv)
      }
    })
  })
  if (haveError) return new PluginError(pluginName, `[${errorKey}]-类型错误`)
}

module.exports = function(options) {
  options = merge.recursive(true, defaultOptions, options || {})

  const LOG_MODE = chalk.yellow(options.dealMode)
  log(chalk.blue(`[tip] 正在处理 ${LOG_MODE} 文件，请稍等...`))

  /**
   * [Note] 模板文件替换匹配
   * PRIVATE_STYLES_PATH  -styles 路径
   * PRIVATE_CREATED      -js created 路径
   * PRIVATE_MOUNTED      -js mounted 路径
   * PRIVATE_IMG          -img 标签名
   * PRIVATE_IMG_TAG      -本地 img 标签
   */
  const PRIVATE_STYLES_PATH = '<PRIVATE_STYLES_PATH/>'
  const PRIVATE_CREATED = '<PRIVATE_CREATED/>'
  const PRIVATE_MOUNTED = '<PRIVATE_MOUNTED/>'
  const PRIVATE_IMG = 'PRIVATE_IMG'
  const PRIVATE_IMG_TAG = /\<PRIVATE_IMG[\S\s]*?\/\>/g

  /**
   * [Note] options延伸常量
   * DEVELOP      -开发工作目录
   * OUTPUT       -打包输出工作目录
   * CSS_OUT_DIR  -css资源输出目录
   * JS_OUT_DIR   -js资源输出目录
   */
  const DEVELOP = path.join(__dirname, '..', options.develop)
  const OUTPUT = path.join(__dirname, '..', options.output.path)
  const CSS_OUT_DIR = path.join(options.output.assetsPath, 'css')
  const JS_OUT_DIR = path.join(options.output.assetsPath, 'js')
  const IMG_OUT_DIR = path.join(options.output.assetsPath, 'img')
  const ASSETS_PREFIX = options.output.assetsPrefix

  const stream = through2.obj(function(file, enc, cb) {
    // [Verify] 空数据格式验证
    if (file.isNull()) return cb(null, file)

    // [Verify] stream格式验证
    if (file.isStream()) {
      const msg = 'Streaming not supported!'
      this.emit('error', new PluginError(pluginName, msg))
      return cb()
    }

    /**
     * [Note] file延伸常量
     * that         -through2.obj处理返回的stream
     * fileDir      -file文件目录
     * fileName     -file文件名
     */
    const that = this
    const fileDir = path.dirname(file.path)
    const fileName = path.basename(file.path)

    /**
     * [Note] file文件中require引入路径修改为绝对路径
     * 便于requireFromString可以找到相应的模块
     */
    let fileStr = file.contents.toString()
    const fileReq = fileStr.match(/require\(['|"]\S+['|"]\)/g)
    fileReq.map((s, i) => {
      const fileReqPath = s.match(/['|"](\S+)['|"]/)[1]
      const fileExactReqPath = path
        .join(fileDir, fileReqPath)
        .replace(/\\/g, '\\\\')
      const reqFunc = options.mode === 'development' ? 'reload' : 'require'
      const fileExactReq = `${reqFunc}('${fileExactReqPath}')`
      fileStr = fileStr.replace(fileReq[i], fileExactReq)
    })
    if (options.mode === 'development') {
      fileStr =
        'const reload = require("require-reload")(require)\r\n' + fileStr
    }

    /**
     * [Note] 获取source内容
     * 并通过propsTypes函数验证其内容格式
     */
    const source = requireFromString(fileStr)
    const propsVerify = propsTypes(propsFormat, source)
    if (propsVerify) {
      this.emit('error', propsVerify)
      return cb()
    }

    /**
     * [Note] source延伸常量
     * name, styles, template, data  -参考props
     * sList                         -待处理的样式文件路径集合
     * jsList                        -待处理的js标识与替换匹配字符串集合
     */
    const { name, styles, template, data } = source
    const sList = typeof styles === 'string' ? [styles] : styles
    const jsList = [
      { name: 'created', rep: PRIVATE_CREATED },
      { name: 'mounted', rep: PRIVATE_MOUNTED }
    ]

    /**
     * [Tools] 文件大小计算工具
     * 计算有误，稍后查百度完善
     * @param {String || Buffer} content 文件内容
     */
    function fileSizeClacTools(content) {
      if (Buffer.isBuffer(content)) {
        content = content.toString()
      }
      let len = content.length
      if (len > 1024) {
        len = (len / 1024 - 0.05).toFixed(2) + 'kb'
      } else {
        len = len.toFixed(2) + 'byte'
      }
      return len
    }

    /**
     * [Tools] 样式路径处理工具
     * @param {String} s 文件引用的样式路径字符串
     * @param {String} type 返回数据类型 'path' or 'link'
     */
    function stylePathTools(s, type) {
      type = type || 'link'
      const sOutName = name + '-' + path.basename(s)
      const sOutPath = path.join(CSS_OUT_DIR, sOutName)
      if (type === 'path') return sOutPath

      let cssOutPath = sOutPath
      const stylesExt = path.extname(s)
      if (stylesExt === '.less') cssOutPath = ext(sOutPath, '.css')
      cssOutPath = cssOutPath.replace(/\\/g, '/')
      return `<link rel="stylesheet" href="${ASSETS_PREFIX}${cssOutPath}" />`
    }

    /**
     * [Tools] script路径处理工具
     * @param {String} sign js数据标识
     * @param {String} type 返回数据类型 'path' or 'script'
     */
    function scriptPathTools(sign, type) {
      const js = source[sign]
      if (!js) return ''

      type = type || 'script'
      const jsOutName = name + '-' + sign + '-' + fileName
      let jsOutPath = path.join(JS_OUT_DIR, jsOutName)
      jsOutPath = ext(jsOutPath, '.js')
      if (type === 'path') return jsOutPath

      jsOutPath = jsOutPath.replace(/\\/g, '/')
      return `<script src="${ASSETS_PREFIX}${jsOutPath}"></script>`
    }

    /**
     * [Tools] img路径处理工具
     * @param {String} img img html标签
     * @param {String} type 返回数据类型 'src' or 'path' or 'img'
     */
    function imgPathTools(img, type) {
      type = type || 'img'
      const imgSrcReg = /src=["|'](\S+\.(jpeg|png|jpg|gif){1})["|']/
      const imgSrc = img.match(imgSrcReg)
      if (!imgSrc) return ''
      if (type === 'src') return imgSrc[1]

      const imgName = path.basename(imgSrc[1])
      let imgOutPath = path.join(IMG_OUT_DIR, imgName)
      if (type === 'path') return imgOutPath

      imgOutPath = imgOutPath.replace(/\\/g, '/')
      const imgTag = img
        .replace(imgSrcReg, `src="${ASSETS_PREFIX}${imgOutPath}"`)
        .replace(PRIVATE_IMG, 'img')
      return imgTag
    }

    // [Mode] html处理模式
    function htmlDealMode() {
      // [Note] art编译
      let html = template(data)

      // [Note] 样式路径处理
      let cssLink = sList.reduce((all, s) => {
        all += stylePathTools(s)
        return all
      }, '')
      html = html.replace(PRIVATE_STYLES_PATH, cssLink)

      // [Note] js路径处理
      jsList.map(s => {
        const res = scriptPathTools(s.name)
        html = html.replace(s.rep, res)
      })

      // [Note] img路径处理
      const imgList = html.match(PRIVATE_IMG_TAG)
      imgList.map(img => {
        const res = imgPathTools(img)
        html = html.replace(PRIVATE_IMG_TAG, res)
      })

      // [Note] 输出file
      const htmlName = name + '.html'
      file.path = path.join(DEVELOP, htmlName)
      file.contents = Buffer.from(html)

      // [Note] log提示
      const htmlSize = fileSizeClacTools(html)
      const logGreen = chalk.green(`[success] ${LOG_MODE}->${htmlName} `)
      const logSize = chalk.underline.yellow(` size: ${htmlSize} `)
      log(logGreen + logSize)

      cb(null, file)
    }

    // [Mode] css处理模式
    function stylesDealMode(n) {
      n = n || 0
      const s = sList[n]
      const sPath = path.join(fileDir, s)

      fs.readFile(sPath, (err, sData) => {
        if (err) {
          this.emit('error', err)
          return cb()
        }

        // [Note] 传递文件
        const sOutPath = stylePathTools(s, 'path')
        const sExactOutPath = path.join(OUTPUT, '..', sOutPath)
        const sFile = new gulpUtil.File({
          path: sExactOutPath,
          contents: sData
        })
        that.push(sFile)

        // [Note] log提示
        const sName = path.basename(sExactOutPath)
        const size = fileSizeClacTools(sData)
        const logGreen = chalk.green(`[success] ${LOG_MODE}->${sName} `)
        const logSize = chalk.underline.yellow(` size: ${size} `)
        log(logGreen + logSize)

        // [Note] 递归条件
        if (n === sList.length - 1) {
          return cb()
        } else {
          n++
          stylesDealMode(n)
        }
      })
    }

    // [Mode] js处理模式
    function scriptDealMode() {
      jsList.map((s, i) => {
        let js = source[s.name].toString()
        if (!js) return cb()

        // [Note] 传递文件
        js = `;(function ${js})(window);`
        const jsData = Buffer.from(js)
        const jsOutPath = scriptPathTools(s.name, 'path')
        const jsExactOutPath = path.join(OUTPUT, '..', jsOutPath)
        const jsFile = new gulpUtil.File({
          path: jsExactOutPath,
          contents: jsData
        })
        that.push(jsFile)

        // [Note] log提示
        const jsName = path.basename(jsExactOutPath)
        const jsSize = fileSizeClacTools(jsData)
        const logGreen = chalk.green(`[success] ${LOG_MODE}->${jsName} `)
        const logSize = chalk.underline.yellow(` size: ${jsSize} `)
        log(logGreen + logSize)

        // [Note] 结束条件
        if (i === jsList.length - 1) return cb()
      })
    }

    // [Mode] img处理模式
    function imgDealMode() {
      let html = template(data)
      let imgList = html.match(PRIVATE_IMG_TAG)

      function imgOutTools(n) {
        n = n || 0
        const img = imgList[n]
        let imgSrc = imgPathTools(img, 'src')
        if (!imgSrc) return cb()

        let imgPath
        if (/\@/.test(imgSrc)) {
          imgSrc = imgSrc.replace('@', '')
          imgPath = path.join(DEVELOP, imgSrc)
        } else {
          imgPath = path.join(fileDir, imgSrc)
        }

        fs.readFile(imgPath, (err, imgData) => {
          if (err) {
            this.emit('error', err)
            return cb()
          }

          // [Note] 传递文件
          const imgOutPath = imgPathTools(img, 'path')
          const imgExactOutPath = path.join(OUTPUT, '..', imgOutPath)
          const imgFile = new gulpUtil.File({
            path: imgExactOutPath,
            contents: imgData
          })
          that.push(imgFile)

          // [Note] log提示
          const imgName = path.basename(imgExactOutPath)
          const size = fileSizeClacTools(imgData)
          const logGreen = chalk.green(`[success] ${LOG_MODE}->${imgName} `)
          const logSize = chalk.underline.yellow(` size: ${size} `)
          log(logGreen + logSize)

          // [Note] 递归条件
          if (n === imgList.length - 1) {
            return cb()
          } else {
            n++
            imgOutTools(n)
          }
        })
      }
      imgOutTools()
    }

    if (options.dealMode === 'art') htmlDealMode()
    if (options.dealMode === 'css') stylesDealMode()
    if (options.dealMode === 'js') scriptDealMode()
    if (options.dealMode === 'img') imgDealMode()
  })
  return stream
}
