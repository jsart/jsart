const path = require('path');
const template = require('art-template');
const through2 = require('through2');
const gulpUtil = require('gulp-util');
const ext = gulpUtil.replaceExtension;
const PluginError = gulpUtil.PluginError;

const config = require('./wbt.config');

module.exports = function(options) {
	options = options || {};

	return through2.obj(function(file, enc, cb) {
		if (file.isNull()) return cb(null, file);

		if (file.isStream()) return cb(new PluginError('gulp-art-template', 'Streaming not supported'));

		var data = {};
		for (let opt in options) {
			const name = options[opt].name;
			const fileName = path.parse(file.path).name;
			if (name === fileName) {
				data = options[opt].data;
			}
		}
		data.headStylesSuffix = 'css';
		const tpl = template.render(file.contents.toString(), data, config.artTemplate);

		file.path = ext(file.path, '.html');
		file.contents = new Buffer(tpl);
		cb(null, file);
	});
};
