// 引入npm资源
const path = require('path');
const gulp = require('gulp');
const gulpLess = require('gulp-less');
const gulpUglify = require('gulp-uglify');
const gulpMinifyCSS = require('gulp-minify-css');
const gulpImageMin = require('gulp-imagemin');
const del = require('del');
const gulpArt = require('./gulp-plugin/gulp-art');
const config = require('./config');

// 根据配置文件生成静态文件路径
const createPath = (cType) => {
	var sourcePath, outputPath;
	var sourceRootPath = config.artTemplate.root;
	var outputRootPath = config.output.file;
	if (cType === 'art') {
		sourcePath = path.join(sourceRootPath, config.artFilePath);
		outputPath = path.join(outputRootPath, config.artFilePath);
	} else {
		sourcePath = path.join(sourceRootPath, config.devServer.assetsFile[cType]);
		outputPath = path.join(outputRootPath, config.output.assetsFile[cType]);
	}
	return {
		source: sourcePath,
		output: outputPath
	};
};

// 清理输出文件夹
gulp.task('clean-dist', (done) => {
	return del([config.output.file + '/**/*'], done);
});

// 编译art模板文件
gulp.task('art', () => {
	const artPath = createPath('art');
	return gulp
		.src(artPath.source + '/*.art')
		.pipe(gulpArt(config))
		.pipe(gulp.dest(artPath.output));
});

// 编译less样式为css
gulp.task('less', () => {
	const stylePath = createPath('style');
	return gulp
		.src(stylePath.source + '/*.less')
		.pipe(gulpLess())
		.pipe(gulpMinifyCSS())
		.pipe(gulp.dest(stylePath.output));
});

// 拷贝css样式文件
gulp.task('css', () => {
	const stylePath = createPath('style');
	return gulp
		.src(stylePath.source + '/*.css')
		.pipe(gulp.dest(stylePath.output));
});

// 压缩js文件
gulp.task('script', () => {
	const jsPath = createPath('script');
	return gulp
		.src(jsPath.source + '/*.js')
		.pipe(gulpUglify())
		.pipe(gulp.dest(jsPath.output));
});

// 压缩图片
gulp.task('img', () => {
	const imgPath = createPath('img');
	return gulp
		.src(imgPath.source + '/*.*')
		.pipe(gulpImageMin({
			progressive: true
		}))
		.pipe(gulp.dest(imgPath.output));
});

// 打包
gulp.task('build', gulp.series('clean-dist', gulp.parallel('art', 'less', 'css', 'script', 'img')));
