const path = require('path')
const gulp = require('gulp')
const chalk = require('chalk')
const gulpConnect = require('gulp-connect')
const config = require('../config')

const devServer = config.devServer
const develop = config.develop
const output = config.output.path
const macthDevPath = develop + '/**/*'
const macthOutPath = output + '/**/*'
const watchOpt = { delay: devServer.hotDelay }
const log = console.log

// [development] 刷新html任务
gulp.task('reload', done => {
  gulp.src(macthOutPath + '.html').pipe(gulpConnect.reload())
  done()
})

// [development] 监听任务
gulp.task('watch', done => {
  const macthArtTask = [macthDevPath + '.art', develop + '/data/**/*.js']
  gulp.watch(macthArtTask, watchOpt, gulp.series('template:art'))
  gulp.watch(macthDevPath + '.less', watchOpt, gulp.series('assets:less'))
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
  gulpConnect.server({
    root: './' + output,
    port: devServer.port,
    host: devServer.host,
    livereload: true
  })
  done()
})

// [development] 开发调试
gulp.task(
  'dev',
  gulp.series('build', gulp.parallel('watch', 'server')),
  done => done
)
