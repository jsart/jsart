// 引入npm资源
const path = require('path');
const Koa = require('koa');
const static = require('koa-static');
const route = require('koa-route');
const loader = require('loader-koa');
const render = require('koa-art-template');
const config = require('./config');
console.log('Please wait while starting the service.');

const app = new Koa();
render(app, config.artTemplate);
console.log('art template loading...');

const rootPath = config.artTemplate.root;
app.use(loader.less(rootPath));
app.use(static(rootPath));
console.log('static file loading...');

const doCreateRoute = () => {
	console.log('create route...');
	return new Promise((resolve) => {
		const appMainRoute = config.router;
		for (let r in appMainRoute) {
			app.use(
				route.get(appMainRoute[r].path, async function (ctx) {
					const view = path.join(config.artFilePath, appMainRoute[r].name);
					const data = appMainRoute[r].data;
					data.headStylesSuffix = config.devServer.headStylesSuffix;
					data.assetsPath = config.devServer.assetsFile;
					await ctx.render(view, data);
				})
			);
		}
		console.log('create route success!');
		resolve('success');
	});
};

// 创建服务
doCreateRoute().then((res) => {
	console.log('create server...');

	app.listen(config.devServer.port);

	console.log('create server success: \r\n' +
		'open http://localhost:' + config.devServer.port + '\r\n' +
		'open http://' + config.devServer.host + ':' + config.devServer.port
	);

	app.on('error', function (err) {
		console.log(err.stack);
	});
	return;
});
