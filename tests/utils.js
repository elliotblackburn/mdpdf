const path = require('path');

const createOptions = function (options) {
	const source = options.source;
	const destination = options.destination ||
        source.slice(0, source.indexOf('.md')) + '.pdf';
	const debug = options.debug || false;

	return {
		ghStyle: true,
		defaultStyle: true,
		source: path.resolve(source),
		destination: path.resolve(destination),
		assetDir: path.dirname(path.resolve(source)),
		styles: null,
		header: null,
		debug: debug ? source.slice(0, source.indexOf('.md')) + '.html' : null,
		pdf: {
			format: 'A4',
			base: path.join('file://', __dirname, '/assets/'),
			header: {
				height: null
			},
			border: {
				top: '10mm',
				left: '10mm',
				bottom: '10mm',
				right: '10mm'
			}
		}
	};
};

module.exports = {
	createOptions
};
