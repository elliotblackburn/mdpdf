#!/usr/bin/env node
let mdpdf = require('../');
let path = require('path');
let argv = require('yargs')
    .version()
    .option('source', {
        describe: 'The source markdown file with one of the following extensions: .md, .markdown, .mkd, .mkdown'
    })
    .option('disableGhStyle', {
        describe: 'Disable the default GitHub markdown stylesheet',
        type: 'boolean'
    })
    .option('style', {
        describe: 'A single css stylesheet you wish to apply to the PDF'
    })
    .option('header', {
        describe: 'A handlebars (.hbs) file to inject into the header of the PDF'
    })
    .option('headerHeight', {
        describe: 'The height of the header section in mm'
    })
    .option('debug', {
        describe: 'Save the generated html for debugging',
        type: 'boolean'
    })
    .demandOption('source', 'Please provide a source file')
    .help()
    .argv;

function isMd(path){
  if(!path) return true;
  var accepted = ["markdown", "md", "mkd", "mkdown", "ron"];
  var current = path.split(".").pop();
  if(accepted.indexOf(current) != -1) return true;
  return false;
}

let source = argv.source;
if (!isMd(source)) {
    console.error('Source file must be a markdown file with extension .markdown, .md, .mkd, or .mkdown');
}
let destination = source.slice(0, source.indexOf('.md')) + '.pdf';

let options = {
    ghStyle: !argv.disableGhStyle,
    defaultStyle: true,
    source: path.resolve(source),
    destination: path.resolve(destination),
    assetDir: path.dirname(path.resolve(source)),
    styles: argv.style ? path.resolve(argv.style) : null,
    header: argv.header ? path.resolve(argv.header) : null,
    debug: argv.debug ? source.slice(0, source.indexOf('.md')) + '.html' : null,
    pdf: {
        format: 'A4',
        base: 'file://' + __dirname + '/assets/',
        header: {
            height: argv.headerHeight ? argv.headerHeight + 'mm' : null
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
    console.log('PDF created successfully at:', pdfPath);
}).catch((err) => {
    console.error(err);
    process.exitCode = 1;
});