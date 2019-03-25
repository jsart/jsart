const shareData = require('../src/data/share');

const appMainRoute = [
	{
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
