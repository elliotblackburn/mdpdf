#!/usr/bin/env node
'use strict';

const mdpdf = require('../');
const path = require('path');
const meow = require('meow');

const cli = meow(`
    Usage:
        $ mdpdf <source> [<destination>] [options]

    <source> must be a markdown file, with the extension .md

    Examples:
        $ mdpdf README.md
        $ mdpdf README.md --style styles.css --header header.hbs --hHeight 22

    Options:
        --style    A single css stylesheet you wish to apply to the PDF
        --header   A handlebars (.hbs) file to inject into the header of the PDF
        --hHeight  The height of the header section in mm
        --debug    Save the generated html for debugging
        --help     Display this menu
`, {
    alias: {
        s: 'style',
        h: 'header',
        d: 'debug',
        e: 'hHeight'
    }
});

function isMd(path) {
    if(!path) return true;
    var accepted = ["md"];
    var current = path.split(".").pop();
    if(accepted.indexOf(current) != -1) return true;
    return false;
}

const source = cli.input[0];
if (!source || !isMd(source)) {
    // Invalid source, show help and exit
    return cli.showHelp();
}

const destination = cli.input[1] || source.slice(0, source.indexOf('.md')) + '.pdf';
const debug = cli.flags.debug || false;
const style = cli.flags.style;
const header = cli.flags.header;
const headerHeight = cli.flags.hHeight;

let options = {
    ghStyle: style ? false : true,
    defaultStyle: true,
    source: path.resolve(source),
    destination: path.resolve(destination),
    assetDir: path.dirname(path.resolve(source)),
    styles: style ? path.resolve(style) : null,
    header: header ? path.resolve(header) : null,
    debug: debug ? source.slice(0, source.indexOf('.md')) + '.html' : null,
    pdf: {
        format: 'A4',
        base: 'file://' + __dirname + '/assets/',
        header: {
            height: headerHeight ? headerHeight + 'mm' : null
        },
        border: {
            top: '10mm',
            left: '10mm',
            bottom: '10mm',
            right: '10mm'
        }
    }
};

mdpdf.convert(options).then((pdfPath) => {
    console.log('✨ PDF created successfully at:', pdfPath);
}).catch((err) => {
    console.error(err);
    process.exitCode = 1;
});