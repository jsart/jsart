const path = require('path');
const gulp = require('gulp');
const gulpLess = require('gulp-less');
const gulpUglify = require('gulp-uglify');
const gulpMinifyCSS = require('gulp-minify-css');
const gulpNodemon = require('gulp-nodemon');
const browserSync = require('browser-sync');
const del = require('del');

const gulpArt = require('./config/gulp-art');
const config = require('./config/config');
const appMainRoute = require('./config/route');

// 构建build打包使用
const returnStaticPath = (staticPath, pathType) => {
	var nowFile = '/';
	if (pathType === 'source') {
		nowFile = config.artTemplate.root;
	} else if (pathType === 'output') {
		nowFile = config.output.file;
	}
	return path.join(nowFile, staticPath);
};

gulp.task('clean-dist', async (cb) => {
	del([ 'dist/**/*' ], cb);
});

gulp.task('art', async () => {
	const artPath = path.join(config.artTemplate.root, config.fileList.art);
	const htmlOutPath = path.join(config.output.file, config.fileList.art);
	gulp.src(artPath + '/*.art').pipe(gulpArt(appMainRoute)).pipe(gulp.dest(htmlOutPath));
});

gulp.task('less', async () => {
	const lessPath = returnStaticPath(config.fileList.style, 'source');
	const cssOutPath = returnStaticPath(config.fileList.style, 'output');
	gulp.src(lessPath + '/*.less').pipe(gulpLess()).pipe(gulpMinifyCSS()).pipe(gulp.dest(cssOutPath));
});

gulp.task('script', async () => {
	const jsPath = returnStaticPath(config.fileList.script, 'source');
	const jsOutPath = returnStaticPath(config.fileList.script, 'output');
	gulp.src(jsPath + '/*.js').pipe(gulpUglify()).pipe(gulp.dest(jsOutPath));
});

gulp.task('static-pack', gulp.series('clean-dist', gulp.parallel('art', 'less', 'script')));

// 开发测试打包使用
gulp.task('server', () => {
	gulpNodemon({
		script: 'config/server.js',
		ext: 'js art less',
		watch: [ config.artTemplate.root ],
		env: {
			NODE_ENV: 'development',
			DEV_MODE: 'hot'
		}
	});
});

gulp.task('hot', () => {
	//所需要监听的文件
	console.log('开启监听');
	var files = [ 'config/**', config.artTemplate.root + '/**' ];
	browserSync.init(files, {
		proxy: 'http://' + config.devServer.host + ':' + config.devServer.port,
		browser: 'chrome',
		notify: false
	});

	gulp.watch(files).on('change', browserSync.reload);
});

gulp.task(
	'watch',
	gulp.parallel('server', 'hot', () => {
		console.log('Create service successfully! \r\n Hot update startup...');
	})
);
