import {
  readFile as _readFile,
  writeFile as _writeFile,
  copyFileSync,
  unlinkSync
} from 'fs';
import { join, dirname, resolve } from 'path';
import { promisify } from 'util';
import { fileURLToPath } from 'url';
import showdown from 'showdown';
const { setFlavor, Converter } = showdown;
import showdownEmoji from 'showdown-emoji';
import showdownHighlight from 'showdown-highlight';
import { launch } from 'puppeteer';
import handlebars from 'handlebars';
const { SafeString, compile } = handlebars;
import { allowUnsafeNewFunction } from 'loophole';
import { getStyles, getStyleBlock, qualifyImgSources } from './utils.js';
import { getOptions } from './puppeteer-helper.js';

const readFile = promisify(_readFile);
const writeFile = promisify(_writeFile);

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Main layout template
const layoutPath = join(__dirname, '/layouts/doc-body.hbs');
const headerLayoutPath = join(__dirname, '/layouts/header.hbs');
const footerLayoutPath = join(__dirname, '/layouts/footer.hbs');

function getAllStyles(options) {
  const cssStyleSheets = [];

  // GitHub Markdown Style
  if (options.ghStyle) {
    cssStyleSheets.push(join(__dirname, '/assets/github-markdown-css.css'));
  }
  // Highlight CSS
  cssStyleSheets.push(join(__dirname, '/assets/highlight/styles/github.css'));

  // Some additional defaults such as margins
  if (options.defaultStyle) {
    cssStyleSheets.push(join(__dirname, '/assets/default.css'));
  }

  // Optional user given CSS
  if (options.styles) {
    cssStyleSheets.push(options.styles);
  }

  return {
    styles: getStyles(cssStyleSheets),
    styleBlock: getStyleBlock(cssStyleSheets),
  };
}

function parseMarkdownToHtml(markdown, convertEmojis, enableHighlight) {
  setFlavor('github');
  const options = {
    prefixHeaderId: false,
    ghCompatibleHeaderId: true,
    extensions: []
  };
  
  // Sometimes emojis can mess with time representations
  // such as "00:00:00"
  if (convertEmojis) {
    options.extensions.push(showdownEmoji);
  }

  if (enableHighlight) {
    options.extensions.push(showdownHighlight)
  }

  const converter = new Converter(options);

  return converter.makeHtml(markdown);
}

export async function convert(options) {
  options = options || {};
  if (!options.source) {
    throw new Error('Source path must be provided');
  }

  if (!options.destination) {
    throw new Error('Destination path must be provided');
  }

  options.assetDir = dirname(resolve(options.source));

  const styles = getAllStyles(options);
  let css = new SafeString(styles.styleBlock);
  const local = {
    css: css,
  };

  let source, template;
  
  // Asynchronously convert
  const promises = [
    template = readFile(layoutPath, 'utf8').then(compile),
    source = readFile(options.source, 'utf8'),
    prepareHeader(options, styles.styles).then(v => options.header = v),
    prepareFooter(options).then(v => options.footer = v),
  ];

  let content = parseMarkdownToHtml(await source, !options.noEmoji, !options.noHighlight);

  // This step awaits so options is valid
  await Promise.all(promises);

  template = await template;

  content = qualifyImgSources(content, options);

  local.body = new SafeString(content);

  // Use loophole for this body template to avoid issues with editor extensions
  const html = allowUnsafeNewFunction(() => template(local));

  return createPdf(html, options);
}

function prepareHeader(options, css) {
  if (options.header) {
    let headerTemplate;

    // Get the hbs layout
    return readFile(headerLayoutPath, 'utf8')
      .then((headerLayout) => {
        headerTemplate = compile(headerLayout);

        // Get the header html
        return readFile(options.header, 'utf8');
      })
      .then((headerContent) => {
        const preparedHeader = qualifyImgSources(headerContent, options);

        // Compile the header template
        const headerHtml = headerTemplate({
          content: new SafeString(preparedHeader),
          css: new SafeString(css.replace(/"/gm, "'")),
        });

        return headerHtml;
      });
  } else {
    return Promise.resolve();
  }
}

function prepareFooter(options) {
  if (options.footer) {
    return readFile(options.footer, 'utf8').then((footerContent) => {
      const preparedFooter = qualifyImgSources(footerContent, options);

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

  const tempHtmlPath = resolve(
    dirname(options.destination),
    '_temp.html'
  );

  return writeFile(tempHtmlPath, html)
    .then(async () => {
      const browser = await launch({ headless: 'new' , args: ['--no-sandbox', '--disable-setuid-sandbox'] })
      
      const page = (await browser.pages())[0];
      await page.goto('file:' + tempHtmlPath, { waitUntil: options.waitUntil ?? 'networkidle0' });
      const puppetOptions = getOptions(options);

      await page.pdf(puppetOptions);
      return browser.close();
    })
    .then(() => {
      if (options.debug) {
        copyFileSync(tempHtmlPath, options.debug);
      }
      unlinkSync(tempHtmlPath);

      return options.destination;
    });
}
