// 引入npm资源
const gulp = require('gulp')
const gulpHtmlBtf = require('gulp-html-beautify')
const gulpHtmlMin = require('gulp-htmlmin')
const gulpLess = require('gulp-less')
const gulpUglify = require('gulp-uglify')
const gulpMinifyCSS = require('gulp-minify-css')
const gulpImageMin = require('gulp-imagemin')
const gulpConnect = require('gulp-connect')
const del = require('del')
const gulpPageJsDeal = require('./tools/gulpPageJsDeal')
const config = require('./config')

const develop = config.develop
const output = config.output.path
const devServer = config.devServer
const matchOut = output + '/**/*'
const jsart = develop + '/**/*.jsart'

// 清理输出文件夹
gulp.task('clean', done => {
  del([matchOut], done)
  done()
})

// 编译art模板文件
gulp.task('art', done => {
  config.dealMode = 'art'
  gulp
    .src(jsart)
    .pipe(gulpPageJsDeal(config))
    .pipe(gulpHtmlMin({ collapseWhitespace: true }))
    .pipe(gulpHtmlBtf({ indent_size: 2 }))
    .pipe(gulp.dest(output))
    .pipe(gulpConnect.reload())
  done()
})

// 处理less文件
gulp.task('less', done => {
  config.dealMode = 'css'
  gulp
    .src(jsart)
    .pipe(gulpPageJsDeal(config))
    .pipe(gulpLess())
    .pipe(gulpMinifyCSS())
    .pipe(gulp.dest(output))
    .pipe(gulpConnect.reload())
  done()
})

// 处理js文件
gulp.task('js', done => {
  config.dealMode = 'js'
  gulp
    .src(jsart)
    .pipe(gulpPageJsDeal(config))
    .pipe(gulpUglify())
    .pipe(gulp.dest(output))
    .pipe(gulpConnect.reload())
  done()
})

// 处理img文件
gulp.task('img', done => {
  config.dealMode = 'img'
  const imin = { progressive: true }
  gulp
    .src(jsart)
    .pipe(gulpPageJsDeal(config))
    .pipe(gulpImageMin(imin))
    .pipe(gulp.dest(output))
    .pipe(gulpConnect.reload())
  done()
})

// 构建
gulp.task(
  'build',
  gulp.series('clean', gulp.parallel('art', 'less', 'js', 'img'), done => {
    done()
  })
)

// [development] 监听任务
gulp.task('watch', done => {
  const watchOpt = { delay: devServer.hotDelay }
  const devDir = develop + '/**/*'
  gulp.watch(devDir + '.less', watchOpt, gulp.series('less'))
  gulp.watch(devDir + '.art', watchOpt, gulp.series('build'))
  gulp.watch(devDir + '.jsart', watchOpt, gulp.series('build'))
  gulp.watch(matchOut, watchOpt, done => {
    gulp.src(matchOut + '.html').pipe(gulpConnect.reload())
    done()
  })
  done()
})

// [development] 启动服务
gulp.task('server', done => {
  gulpConnect.server({
    root: './' + output,
    port: devServer.port,
    livereload: true
  })
  done()
})

// [development] 开发调试
gulp.task(
  'dev',
  gulp.series('build', gulp.parallel('watch', 'server')),
  done => {
    done()
  }
)
