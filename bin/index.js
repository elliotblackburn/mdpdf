#!/usr/bin/env node
'use strict';

const path = require('path');
const meow = require('meow');
const mdpdf = require('../');

const cli = meow(`
    Usage:
        $ mdpdf <source> [<destination>] [options]

    <source> must be a markdown file, with the extension .md

    Examples:
        $ mdpdf README.md
        $ mdpdf README.md --style styles.css --header header.hbs --hHeight 22
        $ mdpdf README.md --footer footer.hbs --fHeight 22 --debug

    Options:
        --style    A single css stylesheet you wish to apply to the PDF
        --header   A HTML (.html) file to inject into the header of the PDF (see documentation for details)
        --hHeight  The height of the header section in mm
        --footer   A HTML (.html) file to inject into the footer of the PDF (see documentation for details)
        --fHeight  The height of the footer section in mm
        --debug    Save the generated html for debugging
        --help     Display this menu
        --version  Displays the application version
`, {
	alias: {
		s: 'style',
		h: 'header',
		f: 'footer',
		d: 'debug',
		v: 'version'
	}
});

function isMd(path) {
	if (!path) {
		return true;
	}
	const accepted = ['md'];
	const current = path.split('.').pop();
	if (accepted.indexOf(current) !== -1) {
		return true;
	}
	return false;
}

const source = cli.input[0];
if (!source || !isMd(source)) {
    // Invalid source, show help and exit
	cli.showHelp();
}

const destination = cli.input[1] || source.slice(0, source.indexOf('.md')) + '.pdf';
const debug = cli.flags.debug || false;
const style = cli.flags.style;
const header = cli.flags.header;
const headerHeight = cli.flags.hHeight;
const footer = cli.flags.footer;
const footerHeight = cli.flags.fHeight;

const options = {
	ghStyle: !style,
	defaultStyle: true,
	source: path.resolve(source),
	destination: path.resolve(destination),
	assetDir: path.dirname(path.resolve(source)),
	styles: style ? path.resolve(style) : null,
	header: header ? path.resolve(header) : null,
	footer: footer ? path.resolve(footer) : null,
	debug: debug ? source.slice(0, source.indexOf('.md')) + '.html' : null,
	pdf: {
		format: 'A4',
		quality: '100',
		base: path.join('file://', __dirname, '/assets/'),
		header: {
			height: headerHeight ? headerHeight + 'mm' : null
		},
		footer: {
			height: footerHeight ? footerHeight + 'mm' : null
		},
		border: {
			top: '10mm',
			left: '10mm',
			bottom: '10mm',
			right: '10mm'
		}
	}
};

mdpdf.convert(options).then(pdfPath => {
	console.log('✨ PDF created successfully at:', pdfPath);
}).catch(err => {
	console.error(err);
	process.exitCode = 1;
});
