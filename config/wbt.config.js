// 引入依赖
const path = require('path');

const config = {
	/**
	 * art-template 选项配置，详情请查看官方文档
	 * http://aui.github.io/art-template/zh-cn/docs/options.html
	 */
	artTemplate: {
		root: path.join('src'),
		extname: '.art',
		debug: process.env.NODE_ENV !== 'production'
	},
	fileList: {
		art: 'views',
		img: 'assets/images',
		script: 'assets/scripts',
		style: 'assets/styles'
	},
	output: {
		file: path.join('dist')
	},
	devServer: {
		host: 'localhost',
		port: '8084'
	}
};
module.exports = config;
