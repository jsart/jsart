const path = require('path');
const template = require('art-template');
const through2 = require('through2');
const gulpUtil = require('gulp-util');
const ext = gulpUtil.replaceExtension;
const PluginError = gulpUtil.PluginError;

module.exports = function(options) {
	options = options || {};

	return through2.obj(function(file, enc, cb) {
		if (file.isNull()) return cb(null, file);
		if (file.isStream()) return cb(new PluginError('gulp-art-template', 'Streaming not supported'));

		var data = {};
		var router = options.routerConfig;
		for (let r in router) {
			const name = router[r].name;
			const fileName = path.parse(file.path).name;
			if (name === fileName) {
				data = router[r].data;
			}
		}
		data.headStylesSuffix = options.headStylesSuffix || null;

		const tpl = template.render(file.contents.toString(), data, options.artConfig);

		file.path = ext(file.path, '.html');
		file.contents = new Buffer(tpl);
		cb(null, file);
	});
};
