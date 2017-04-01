'use strict';
const Promise = require('bluebird');
const fs = require('fs');
const path = require('path');
const url = require('url');
const showdown = require('showdown');
const showdownEmoji = require('showdown-emoji');
const cheerio = require('cheerio');
const pdf = require('html-pdf');
const Handlebars = require('handlebars');
Promise.promisifyAll(fs);

// Main layout template
const layoutPath = path.join(__dirname, 'layout.hbs');

// Syntax highlighting
const highlightJs = 'file://' + path.join(__dirname, '/assets/highlight/highlight.pack.js');

function getCssAsHtml(stylesheets) {
    // Read in all stylesheets and format them into HTML to
    // be placed in the header. We do this because the normal
    // <link...> doesn't work for the headers and footers.
    let styleHtml = '';
    for (var i in stylesheets) {
        let style = fs.readFileSync(stylesheets[i], 'utf8');
        styleHtml += '<style>' + style + '</style>';
    }

    return styleHtml;
}

function getAllStyles(options) {
    let cssStyleSheets = [];

    // GitHub Markdown Style
    if (options.ghStyle) {
        cssStyleSheets.push(path.join(__dirname, '/assets/github-markdown-css.css'));
    }
    // Highlight CSS
    cssStyleSheets.push(path.join(__dirname + '/assets/highlight/styles/github.css'));

    // Some additional defaults such as margins
    if (options.defaultStyle) {
        cssStyleSheets.push(path.join(__dirname, '/assets/default.css'));
    }

    // Optional user given CSS
    if (options.styles) {
        cssStyleSheets.push(options.styles);
    }

    return getCssAsHtml(cssStyleSheets);
}

function parseMarkdownToHtml(markdown) {
    showdown.setFlavor('github');
    let converter = new showdown.Converter({
        prefixHeaderId: false,
        ghCompatibleHeaderId: true,
        extensions: [showdownEmoji]
    });

    return converter.makeHtml(markdown);
}

function processSrc(src, options) {
    if (url.parse(src).protocol) {
        // Has a protocol so should be absolute, jobs done
        return src;
    } else if (path.resolve(src) !== src) {
        // Relative path with no protocol, prepend both
        src = path.resolve(options.assetDir, src);
        return 'file://' + src;
    } else {
        // Absolute path, just prepend a protocol
        return 'file://' + src;
    }
}

function qualifyImgSources(html, options) {
    let $ = cheerio.load(html);

    $('img').each(function(i, img) {
        img.attribs.src = processSrc(img.attribs.src, options);
    });

    return $.html();
}

function convert(options) {
    options = options || {};
    if (!options.source) {
        reject(new Error('Source path must be provided'));
    }

    if (!options.destination) {
        reject(new Error('Destination path must be provided'));
    }

    let template = {};
    let local = {
        highlightJs: highlightJs,
        css: new Handlebars.SafeString(getAllStyles(options))
    };

    // Read the layout and compile it
    return fs.readFileAsync(layoutPath, 'utf8').then(function(layout) {
        template = Handlebars.compile(layout);

        if (options.header) {
            return fs.readFileAsync(options.header, 'utf8');
        } else {
            Promise.resolve();
        }
    }).then(function(headerContent) {
        if (headerContent) {
            local.header = new Handlebars.SafeString(headerContent);
        }

        if (options.footer) {
            return fs.readFileAsync(options.footer, 'utf8');
        } else {
            Promise.resolve();
        }
    }).then(function(footerContent) {
        if (footerContent) {
            local.footer = new Handlebars.SafeString(footerContent);
        }

        return fs.readFileAsync(options.source, 'utf8');
    }).then(function(md) {
        let content = parseMarkdownToHtml(md);

        content = qualifyImgSources(content, options);

        // Append final html to the template body
        local.body = new Handlebars.SafeString(content);

        // Generate html from layout and templates
        let html = template(local);

        if (options.debug) {
            // Write debug html
            fs.writeFileSync(options.debug, html);
        }
        
        return createPdf(html, options);
    });
}

function createPdf(html, options) {

    // Promisify won't work due to html-pdf's construction so
    // we wrap it in a promise ourselves.
    return new Promise(function(resolve, reject) {
        pdf.create(html, options.pdf).toFile(options.destination, function(err, res) {
            if (err) {
                reject(err);
            } else {
                resolve(res.filename);
            }
        });
    });
}

module.exports = {
    convert: convert
};
