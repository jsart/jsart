// 引入npm资源
const fs = require('fs')
const path = require('path')
const gulp = require('gulp')
const gulpHtmlBtf = require('gulp-html-beautify')
const gulpHtmlMin = require('gulp-htmlmin')
const gulpUglify = require('gulp-uglify')
const gulpMinifyCSS = require('gulp-minify-css')
const gulpImageMin = require('gulp-imagemin')
const gulpLess = require('gulp-less')
const gulpSass = require('gulp-sass')
gulpSass.compiler = require('node-sass')
const gulpConnect = require('gulp-connect')
const gulpBabel = require('gulp-babel')
const gulpRev = require('gulp-rev')
const gulpIf = require('gulp-if')
const gulpRevCollector = require('gulp-rev-collector')
const gulpArt = require('gulp-jsart')
const del = require('del')
const chalk = require('chalk')
const config = require('../config')

function getRevManifest (assetsList) {
  return {
    style: assetsList + '/css',
    js: assetsList + '/js',
    img: assetsList + '/img'
  }
}
function isProdMode () {
  return process.env.MODE_ENV === 'prod'
}
function isDevMode () {
  return process.env.MODE_ENV === 'dev'
}

const develop = config.develop
const output = config.output.path
const devAssets = path
  .join(develop, config.output.assetsPath)
  .replace(/\\/, '/')
const outAssets = path.join(output, config.output.assetsPath).replace(/\\/, '/')
const assetsList = getRevManifest(config.output.assetsList)
const log = console.log
let assetsTaskEnd = []

// 清理输出文件夹
gulp.task('clean', done => {
  del([output + '/**/*'], done)
  done()
})

// 处理style文件
gulp.task('assets:style', done => {
  const isLess = () => config.useCssPre === 'less'

  const isSass = () => config.useCssPre === 'scss' || config.useCssPre === 'sass'

  let useCssPre = config.useCssPre || 'css'
  if (isSass()) useCssPre = '{sass,scss}'
  const matchStyle = devAssets + '/**/*.' + useCssPre

  gulp
    .src(matchStyle)
    .pipe(gulpIf(isProdMode, gulpRev()))
    .pipe(gulpIf(isLess, gulpLess()))
    .pipe(gulpIf(isSass, gulpSass.sync().on('error', gulpSass.logError)))
    .pipe(gulpMinifyCSS())
    .pipe(gulp.dest(outAssets))
    .pipe(gulpIf(isProdMode, gulpRev.manifest()))
    .pipe(gulpIf(isProdMode, gulp.dest(assetsList.style)))
    .pipe(gulpConnect.reload())
  assetsTaskEnd.push(assetsList.style)
  done()
})

// 处理js文件
gulp.task('assets:js', done => {
  gulp
    .src(devAssets + '/**/*.js')
    .pipe(gulpBabel({presets: ['@babel/env']}))
    .pipe(gulpUglify())
    .pipe(gulpIf(isProdMode, gulpRev()))
    .pipe(gulp.dest(outAssets))
    .pipe(gulpIf(isProdMode, gulpRev.manifest()))
    .pipe(gulpIf(isProdMode, gulp.dest(assetsList.js)))
    .pipe(gulpConnect.reload())
  assetsTaskEnd.push(assetsList.js)
  done()
})

// 处理img文件
gulp.task('assets:img', done => {
  gulp
    .src(devAssets + '/**/*.{jpg,png,gif}')
    .pipe(gulpImageMin({progressive: true}))
    .pipe(gulpIf(isProdMode, gulpRev()))
    .pipe(gulp.dest(outAssets))
    .pipe(gulpIf(isProdMode, gulpRev.manifest()))
    .pipe(gulpIf(isProdMode, gulp.dest(assetsList.img)))
    .pipe(gulpConnect.reload())
  assetsTaskEnd.push(assetsList.img)
  done()
})

// 编译art模板文件
function template_art (cb) {
  const artFile = [develop + '/pages/**/*.art']
  if (isProdMode()) artFile.unshift(config.output.assetsList + '/**/*.json')
  const rep = {'@assets': './assets'}
  const revCollOpt = {
    replaceReved: true,
    dirReplacements: rep
  }

  let artOpt
  if (isDevMode()) {
    rep['\\.(less|scss)'] = '.css'
    artOpt = {rep, mode: process.env.MODE_ENV}
  }

  gulp
    .src(artFile)
    .pipe(gulpArt(artOpt))
    .pipe(gulpIf(isProdMode, gulpRevCollector(revCollOpt)))
    .pipe(gulpHtmlMin({collapseWhitespace: true}))
    .pipe(gulpHtmlBtf({indent_size: 2}))
    .pipe(gulp.dest(output))
    .pipe(gulpConnect.reload())
  if (cb) cb()
}

// 检测资产列表目录是否存在
gulp.task('assets:exist', done => {
  const wList = Object.keys(assetsList)
  const watcher = gulp.watch(config.output.assetsList + '/**/*')
  watcher.on('all', function (event, stats) {
    if (assetsTaskEnd.length === wList.length) {
      setTimeout(() => {
        watcher.close()
        if (event === 'addDir' || event === 'change') template_art(done)
      }, 1000)
    }
  })
})

// 构建
gulp.task('build',
  gulp.series('clean',
    gulp.parallel('assets:exist', 'assets:style', 'assets:js', 'assets:img'),
    done => {
      done()
      log(chalk.green(`[Tip] 编译完成！`))
      log(chalk.blue(`[Thank] 感谢使用“jsart”！`))
      log(chalk.blue(`[Thank] 开发中遇到问题可至点击下方网址进行反馈↓↓↓`))
      log(chalk.blue(`[Thank] https://github.com/jsart/jsart/issues`))
    }))
