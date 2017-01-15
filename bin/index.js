#!/usr/bin/env node
let mdpdf = require('../');
let path = require('path');
let argv = require('yargs')
    .option('source', {
        describe: 'The source markdown file with one of the following extensions: .md, .markdown, .mkd, .mkdown'
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

let source = argv.source;
if (!isMd(source)) {
    throw new Error('Source file must be a markdown file with extension .markdown, .md, .mkd, or .mkdown');
}
let destination = source.slice(0, source.indexOf('.md')) + '.pdf';

// Resolve paths

let options = {
    ghStyle: !argv.style,
    defaultStyle: true,
    source: path.resolve(source),
    destination: path.resolve(destination),
    styles: argv.style ? path.resolve(argv.style) : null,
    header: argv.header ? path.resolve(argv.header) : null,
    debug: argv.debug ? source.slice(0, source.indexOf('.md')) + '.html' : null,
    pdf: {
        format: 'A4',
        base: 'file://' + __dirname + '/assets/',
        header: {
            height: argv.headerHeight ? argv.headerHeight + 'mm' : null
        }
    }
};

mdpdf.convert(options).then((pdfPath) => {
    console.log(pdfPath);
}).catch((err) => {
    console.error(err);
});

function isMd(path){
  if(!path) return true;
  var accepted = ["markdown", "md", "mkd", "mkdown", "ron"];
  var current = path.split(".").pop();
  if(accepted.indexOf(current) != -1) return true;
  return false;
}