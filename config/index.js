// 引入依赖
const path = require('path');
const appMainRoute = require('./_route');

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
	// 路由配置
	router: appMainRoute,
	/**
	 * art 视图模板文件详细路径
	 * 编译将html视图输出至该目录（根路径为artTemplate.root）
	 * 开发调试将基于该目录查找视图文件（根路径为output.file）
	 */
	artFilePath: 'views',
	// 编译输出配置
	output: {
		// 输出根路径
		file: path.join('dist'),
		// 静态文件基于根路径输出路径
		assetsFile: {
			img: 'images',
			script: 'scripts',
			style: 'styles'
		}
	},
	// 开发调试配置
	devServer: {
		host: 'localhost',
		port: '8082',
		// 静态资源配置
		assetsFile: {
			img: 'assets/images',
			script: 'assets/scripts',
			style: 'assets/styles'
		},
		// 开发使用的样式后缀，使用的less就填写.less
		headStylesSuffix: '.less'
	}
};
module.exports = config;
