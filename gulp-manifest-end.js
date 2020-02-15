const merge = require('merge')
const through2 = require('through2')
const gulpUtil = require('gulp-util')

const PLUGIN_NAME = 'gulp-jsart'
const PluginError = gulpUtil.PluginError
const ext = gulpUtil.replaceExtension

module.exports = function(options) {
  options = merge.recursive(true, { mode: 'dev' }, options || {})

  const stream = through2.obj(function(file, enc, cb) {
    // [Verify] 空数据格式验证
    if (file.isNull()) return cb(null, file)

    // [Verify] stream格式验证
    if (file.isStream()) {
      const msg = 'Streaming not supported!'
      throw new PluginError(PLUGIN_NAME, msg)
    }

    file.path = ext(file.path, '.html')
    file.contents = Buffer.from(html)

    cb(null, file)
  })
  return stream
}
