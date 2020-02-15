const gulp = require('gulp')
const merge = require('merge')
const gulpConnect = require('gulp-connect')
const config = require('../config')

const devServer = config.devServer
const develop = config.develop
const output = config.output.path
const macthDevPath = develop + '/**/*'
const macthOutPath = output + '/**/*'
const watchOpt = { delay: devServer.hotDelay }

// [development] 刷新html任务
gulp.task('reload', done => {
  gulp.src(macthOutPath + '.html').pipe(gulpConnect.reload())
  done()
})

// [development] 监听任务
gulp.task('watch', done => {
  const macthArtTask = [macthDevPath + '.art', develop + '/data/**/*.js']
  gulp.watch(macthArtTask, watchOpt, gulp.series('template:art'))

  let useCssPre = config.useCssPre || 'css'
  if (useCssPre === 'scss' || useCssPre === 'sass') useCssPre = '{sass,scss}'
  const matchStyle = macthDevPath + '.' + useCssPre
  gulp.watch(matchStyle, watchOpt, gulp.series('assets:style'))

  gulp.watch(macthDevPath + '.js', watchOpt, gulp.series('assets:js'))
  gulp.watch(
    macthDevPath + '.{jpg,png,gif}',
    watchOpt,
    gulp.series('assets:img')
  )
  gulp.watch(macthOutPath, gulp.series('reload'))
  done()
})

// [development] 启动服务
gulp.task('server', done => {
  const defOpt = {
    root: './' + output,
    livereload: true
  }
  const opt = merge.recursive(true, defOpt, devServer)
  delete opt.hotDelay
  gulpConnect.server(opt)
  done()
})

// [development] 开发调试
gulp.task(
  'dev',
  gulp.series('build', gulp.parallel('watch', 'server')),
  done => done
)
