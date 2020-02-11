// 引入npm资源
const gulp = require('gulp')
const gulpHtmlBtf = require('gulp-html-beautify')
const gulpHtmlMin = require('gulp-htmlmin')
const gulpLess = require('gulp-less')
const gulpUglify = require('gulp-uglify')
const gulpMinifyCSS = require('gulp-minify-css')
const gulpImageMin = require('gulp-imagemin')
const del = require('del')
const gulpPageJsDeal = require('./tools/gulpPageJsDeal')
const config = require('./config')

const develop = config.develop
const output = config.output.path

// 清理输出文件夹
gulp.task('clean', done => {
  return del(['dist/**/*'], done)
})

// 编译art模板文件
gulp.task('art', () => {
  return gulp
    .src(develop + '/**/*.jsart')
    .pipe(gulpPageJsDeal(config))
    .pipe(gulpHtmlMin({ collapseWhitespace: true }))
    .pipe(gulpHtmlBtf({ indent_size: 2 }))
    .pipe(gulp.dest(output))
})

// 处理less文件
gulp.task('less', () => {
  config.dealMode = 'css'
  return gulp
    .src(develop + '/**/*.jsart')
    .pipe(gulpPageJsDeal(config))
    .pipe(gulpLess())
    .pipe(gulpMinifyCSS())
    .pipe(gulp.dest(output))
})

// 处理js文件
gulp.task('js', () => {
  config.dealMode = 'js'
  return gulp
    .src(develop + '/**/*.jsart')
    .pipe(gulpPageJsDeal(config))
    .pipe(gulpUglify())
    .pipe(gulp.dest(output))
})

// 处理img文件
gulp.task('img', () => {
  config.dealMode = 'img'
  const imin = { progressive: true }
  return gulp
    .src(develop + '/**/*.jsart')
    .pipe(gulpPageJsDeal(config))
    .pipe(gulpImageMin(imin))
    .pipe(gulp.dest(output))
})

// 打包
gulp.task(
  'build',
  gulp.series('clean', gulp.parallel('art', 'less', 'js', 'img'))
)
