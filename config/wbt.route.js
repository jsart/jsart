const shareData = require('../src/data/share');

const appMainRoute = [
	{
		path: '/',
		name: 'home',
		data: shareData,
		outRename: 'testHome'
	},
	{
		path: '/about',
		name: 'about',
		data: shareData,
		outRename: 'testHome'
	}
];

module.exports = appMainRoute;
