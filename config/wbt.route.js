const shareData = require('../src/data/share');

const appMainRoute = [
	{
		path: '/',
		name: 'home',
		data: shareData,
		outRename: 'index'
	}
];

module.exports = appMainRoute;
