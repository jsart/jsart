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
const del = require('del')
const chalk = require('chalk')
const gulpArt = require('gulp-jsart')
const config = require('../config')

const develop = config.develop
const output = config.output.path
const assetsList = config.output.assetsList
const devAssets = path
  .join(develop, config.output.assetsPath)
  .replace(/\\/, '/')
const outAssets = path.join(output, config.output.assetsPath).replace(/\\/, '/')
const log = console.log
let haveAssetsList = false

const isProdMode = () => {
  return process.env.MODE_ENV === 'prod'
}
const isDevMode = () => {
  return process.env.MODE_ENV === 'dev'
}

// 清理输出文件夹
gulp.task('clean', done => {
  del([output + '/**/*'], done)
  done()
})

// 编译art模板文件
gulp.task('template:art', done => {
  const artFile = [develop + '/pages/**/*.art']
  if (isProdMode()) artFile.unshift(assetsList + '/**/*.json')
  const rep = { '@assets': './assets' }
  const revCollOpt = {
    replaceReved: true,
    dirReplacements: rep
  }

  let artOpt
  if (isDevMode()) {
    rep['\\.(less|scss)'] = '.css'
    artOpt = { rep, mode: process.env.MODE_ENV }
  }

  gulp
    .src(artFile)
    .pipe(gulpArt(artOpt))
    .pipe(gulpIf(isProdMode, gulpRevCollector(revCollOpt)))
    .pipe(gulpHtmlMin({ collapseWhitespace: true }))
    .pipe(gulpHtmlBtf({ indent_size: 2 }))
    .pipe(gulp.dest(output))
    .pipe(gulpConnect.reload())
  done()
})

// 处理style文件
gulp.task('assets:style', done => {
  const isLess = () => {
    return config.useCssPre === 'less'
  }

  const isSass = () => {
    return config.useCssPre === 'scss' || config.useCssPre === 'sass'
  }

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
    .pipe(gulpIf(isProdMode, gulp.dest(assetsList + '/css')))
    .pipe(gulpConnect.reload())
  done()
})

// 处理js文件
gulp.task('assets:js', done => {
  gulp
    .src(devAssets + '/**/*.js')
    .pipe(gulpBabel({ presets: ['@babel/env'] }))
    .pipe(gulpUglify())
    .pipe(gulpIf(isProdMode, gulpRev()))
    .pipe(gulp.dest(outAssets))
    .pipe(gulpIf(isProdMode, gulpRev.manifest()))
    .pipe(gulpIf(isProdMode, gulp.dest(assetsList + '/js')))
    .pipe(gulpConnect.reload())
  done()
})

// 处理img文件
gulp.task('assets:img', done => {
  gulp
    .src(devAssets + '/**/*.{jpg,png,gif}')
    .pipe(gulpImageMin({ progressive: true }))
    .pipe(gulpIf(isProdMode, gulpRev()))
    .pipe(gulp.dest(outAssets))
    .pipe(gulpIf(isProdMode, gulpRev.manifest()))
    .pipe(gulpIf(isProdMode, gulp.dest(assetsList + '/img')))
    .pipe(gulpConnect.reload())
  done()
})

// 检测资产列表目录是否存在
gulp.task('assets:stat', done => {
  const assetsListDir = path.join(__dirname, '..', assetsList)
  fs.exists(assetsListDir, res => {
    haveAssetsList = res
    done()
  })
})

// 构建
gulp.task(
  'build',
  gulp.series(
    'clean',
    'assets:stat',
    gulp.parallel('assets:style', 'assets:js', 'assets:img'),
    'template:art',
    done => {
      done()
      if (!haveAssetsList) {
        const msg = `[Tip] 检测到构建前您还没有“${assetsList}”文件，请再次执行构建任务，以确保html文件中的资产路径被正确替换！`
        log(chalk.yellow(msg))
      } else {
        log(chalk.green(`[Tip] 编译完成！`))
        log(chalk.blue(`[Thank] 感谢使用“jsart”！`))
        log(chalk.blue(`[Thank] 开发中遇到问题可至点击下方网址进行反馈↓↓↓`))
        log(chalk.blue(`[Thank] https://github.com/jsart/jsart/issues`))
      }
    }
  )
)
