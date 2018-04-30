const fs = require('fs');
const path = require('path');
const Promise = require('bluebird');
const showdown = require('showdown');
const showdownEmoji = require('showdown-emoji');
const puppeteer = require('puppeteer');
const Handlebars = require('handlebars');
const loophole = require('loophole');
const utils = require('./utils');
const puppeteerHelper = require('./puppeteer-helper');

const readFile = Promise.promisify(fs.readFile);
const writeFile = Promise.promisify(fs.writeFile);

// Main layout template
const layoutPath = path.join(__dirname, '/layouts/doc-body.hbs');
const headerLayoutPath = path.join(__dirname, '/layouts/header.hbs');
const footerLayoutPath = path.join(__dirname, '/layouts/footer.hbs');

// Syntax highlighting
const highlightJs =
  'file://' + path.join(__dirname, '/assets/highlight/highlight.pack.js');

function getAllStyles(options) {
  const cssStyleSheets = [];

  // GitHub Markdown Style
  if (options.ghStyle) {
    cssStyleSheets.push(
      path.join(__dirname, '/assets/github-markdown-css.css')
    );
  }
  // Highlight CSS
  cssStyleSheets.push(
    path.join(__dirname, '/assets/highlight/styles/github.css')
  );

  // Some additional defaults such as margins
  if (options.defaultStyle) {
    cssStyleSheets.push(path.join(__dirname, '/assets/default.css'));
  }

  // Optional user given CSS
  if (options.styles) {
    cssStyleSheets.push(options.styles);
  }

  return {
    styles: utils.getStyles(cssStyleSheets),
    styleBlock: utils.getStyleBlock(cssStyleSheets),
  };
}

function parseMarkdownToHtml(markdown, convertEmojis) {
  showdown.setFlavor('github');
  const options = {
    prefixHeaderId: false,
    ghCompatibleHeaderId: true,
  };

  // Sometimes emojis can mess with time representations
  // such as "00:00:00"
  if (convertEmojis) {
    options.extensions = [showdownEmoji];
  }

  const converter = new showdown.Converter(options);

  return converter.makeHtml(markdown);
}

function convert(options) {
  options = options || {};
  if (!options.source) {
    throw new Error('Source path must be provided');
  }

  if (!options.destination) {
    throw new Error('Destination path must be provided');
  }

  options.assetDir = path.dirname(path.resolve(options.source));

  let template = {};
  const styles = getAllStyles(options);
  let css = new Handlebars.SafeString(styles.styleBlock);
  const local = {
    highlightJs,
    css: css,
  };

  // Pull in the header
  return prepareHeader(options, styles.styles)
    .then(header => {
      options.header = header;

      // Pull in the footer
      return prepareFooter(options);
    })
    .then(footer => {
      options.footer = footer;

      // Pull in the handlebars layout so we can build the document body
      return readFile(layoutPath, 'utf8');
    })
    .then(layout => {
      template = Handlebars.compile(layout);

      // Pull in the document source markdown
      return readFile(options.source, 'utf8');
    })
    .then(mdDoc => {
      // Compile the main document
      let content = parseMarkdownToHtml(mdDoc, !options.noEmoji);

      content = utils.qualifyImgSources(content, options);

      local.body = new Handlebars.SafeString(content);
      // Use loophole for this body template to avoid issues with editor extensions
      const html = loophole.allowUnsafeNewFunction(() => template(local));

      return createPdf(html, options);
    });
}

function prepareHeader(options, css) {
  if (options.header) {
    let headerTemplate;

    // Get the hbs layout
    return readFile(headerLayoutPath, 'utf8')
      .then(headerLayout => {
        headerTemplate = Handlebars.compile(headerLayout);

        // Get the header html
        return readFile(options.header, 'utf8');
      })
      .then(headerContent => {
        const preparedHeader = utils.qualifyImgSources(headerContent, options);

        // Compile the header template
        const headerHtml = headerTemplate({
          content: new Handlebars.SafeString(preparedHeader),
          css: new Handlebars.SafeString(css.replace(/"/gm, "'")),
        });

        return headerHtml;
      });
  } else {
    return Promise.resolve();
  }
}

function prepareFooter(options) {
  if (options.footer) {
    return readFile(options.footer, 'utf8').then(footerContent => {
      const preparedFooter = utils.qualifyImgSources(footerContent, options);

      return preparedFooter;
    });
  } else {
    return Promise.resolve();
  }
}

function createPdf(html, options) {
  // Write html to a temp file
  let browser;
  let page;

  const tempHtmlPath = path.join(
    path.dirname(options.destination),
    '_temp.html'
  );

  return writeFile(tempHtmlPath, html)
    .then(() => {
      return puppeteer.launch({ headless: true });
    })
    .then(newBrowser => {
      browser = newBrowser;
      return browser.newPage();
    })
    .then(p => {
      page = p;

      return page.goto('file:' + tempHtmlPath, { waitUntil: 'networkidle2' });
    })
    .then(() => {
      const puppetOptions = puppeteerHelper.getOptions(options);

      return page.pdf(puppetOptions);
    })
    .then(() => {
      return browser.close();
    })
    .then(() => {
      if (options.debug) {
        fs.createReadStream(tempHtmlPath).pipe(fs.createWriteStream(options.debug));
      }

      fs.unlinkSync(tempHtmlPath);

      return options.destination;
    });
}

module.exports = {
  convert,
};
