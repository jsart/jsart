// 引入npm资源
const path = require('path');
const gulp = require('gulp');
const gulpLess = require('gulp-less');
const gulpUglify = require('gulp-uglify');
const gulpMinifyCSS = require('gulp-minify-css');
const gulpNodemon = require('gulp-nodemon');
const browserSync = require('browser-sync');
const del = require('del');

// 引入配置文件
const gulpArt = require('./config/gulp-art');
const config = require('./config/wbt.config');
const appMainRoute = require('./config/wbt.route');

// 根据配置文件生成静态文件路径
const returnStaticPath = (staticPath, pathType) => {
	var nowFile = '/';
	if (pathType === 'source') {
		nowFile = config.artTemplate.root;
	} else if (pathType === 'output') {
		nowFile = config.output.file;
	}
	return path.join(nowFile, staticPath);
};

// 清理输出文件夹
gulp.task('clean-dist', (done) => {
	return del([ config.output.file + '/**/*' ], done);
});

// 编译art模板文+件
gulp.task('art', () => {
	const artPath = path.join(config.artTemplate.root, config.fileList.art);
	const htmlOutPath = path.join(config.output.file, config.fileList.art);
	return gulp
		.src(artPath + '/*.art')
		.pipe(gulpArt({ routerConfig: appMainRoute, artConfig: config.artTemplate, headStylesSuffix: 'css' }))
		.pipe(gulp.dest(htmlOutPath));
});

// 编译less样式为css
gulp.task('less', () => {
	const lessPath = returnStaticPath(config.fileList.style, 'source');
	const cssOutPath = returnStaticPath(config.fileList.style, 'output');
	return gulp.src(lessPath + '/*.less').pipe(gulpLess()).pipe(gulpMinifyCSS()).pipe(gulp.dest(cssOutPath));
});

// 拷贝css样式文件
gulp.task('css', () => {
	const cssPath = returnStaticPath(config.fileList.style, 'source');
	const cssOutPath = returnStaticPath(config.fileList.style, 'output');
	return gulp.src(cssPath + '/*.css').pipe(gulp.dest(cssOutPath));
});

// 压缩js文件
gulp.task('script', () => {
	const jsPath = returnStaticPath(config.fileList.script, 'source');
	const jsOutPath = returnStaticPath(config.fileList.script, 'output');
	return gulp.src(jsPath + '/*.js').pipe(gulpUglify()).pipe(gulp.dest(jsOutPath));
});

// 打包
gulp.task('build', gulp.series('clean-dist', gulp.parallel('art', 'less', 'css', 'script')));

// 用于开发测试打包
gulp.task('server', () => {
	gulpNodemon({
		script: 'config/wbt.server.js',
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
