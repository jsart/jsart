// 导入art模板数据
const shareData = require('../src/data/share');

// 配置开发路由
const appMainRoute = [{
		path: '/',
		name: 'home',
		data: shareData
	},
	{
		path: '/about',
		name: 'about',
		data: shareData
	}
];

module.exports = appMainRoute;
