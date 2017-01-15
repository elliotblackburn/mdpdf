let Promise = require('bluebird');
let fs = require('fs');
let path = require('path');
let marked = require('marked');
let pdf = require('html-pdf');
let Handlebars = require('handlebars');
Promise.promisifyAll(fs);

// Main layout template
let layoutPath = path.join(__dirname, 'layout.hbs');

// Syntax highlighting
let highlightJs = path.join(__dirname, '/assets/highlight/highlight.pack.js');

// Marked configuration
marked.setOptions({
    renderer: new marked.Renderer(),
    gfm: true,
    tables: true,
    breaks: false,
    pedantic: false,
    sanitize: true,
    smartLists: true,
    smartypants: false
});

function getCssAsHtml(stylesheets) {
    // Read in all stylesheets and format them into HTML to
    // be placed in the header. We have to do this because
    // the normal <link...> doesn't work for the headers
    // and footers.
    let styleHtml = '';
    for(var i in stylesheets) {
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

    // Optional CSS
    if (options.styles) {
        cssStyleSheets.push(options.styles);
    }

    // Some additional defaults such as margins
    if (options.defaultStyle) {
        cssStyleSheets.push(path.join(__dirname, '/assets/default.css'));
    }

    return getCssAsHtml(cssStyleSheets);
}

function convert(options) {
    return new Promise((resolve, reject) => {

        options = options || {};
        if (!options.source) {
            reject(new Error('Source path must be provided'));
        }

        if (!options.destination) {
            reject(new Error('Desintation path must be provided'));
        }

        let template = {};
        let local = {
            highlightJs: highlightJs,
            css: new Handlebars.SafeString(getAllStyles(options))
        };

        fs.readFileAsync(layoutPath, 'utf8').then(function(layout) {
            template = Handlebars.compile(layout);

            // Read the header if one has been provided
            if (options.header) {
                let header = fs.readFileSync(options.header, 'utf8');
                local.header = new Handlebars.SafeString(header);
            }

            return fs.readFileAsync(options.source, 'utf8');
        }).then(function(md) {
            // Append the body
            local.body = new Handlebars.SafeString(marked(md));

            // Generate html from layout and templates
            let html = template(local);

            if (options.debug) {
                // Write debug html
                fs.writeFileSync(options.debug, html);
            }
            
            // Write PDF
            pdf.create(html, options.pdf).toFile(options.destination, function(err, res) {
                if (err) console.log(err);
                
                resolve(res.filename);
            });   
        }).catch(function(err) {
            reject(err);
        });
    });
}

module.exports = {
    convert: convert
};