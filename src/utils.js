const fs = require('fs');
const url = require('url');
const fileUrl = require('file-url');
const cheerio = require('cheerio');

function getStyleBlock(stylesheets) {
  // Read in all stylesheets and format them into HTML to
  // be placed in the header. We do this because the normal
  // <link...> doesn't work for the headers and footers.
  let styleHtml = '';
  for (const i in stylesheets) {
    if (Object.prototype.hasOwnProperty.call(stylesheets, i)) {
      const style = fs.readFileSync(stylesheets[i], 'utf8');
      styleHtml += '<style>' + style + '</style>';
    }
  }

  return styleHtml;
}

function getStyles(stylesheets) {
  let styleHtml = '';
  for (const i in stylesheets) {
    if (Object.prototype.hasOwnProperty.call(stylesheets, i)) {
      const style = fs.readFileSync(stylesheets[i], 'utf8');
      styleHtml += style;
    }
  }

  return styleHtml;
}

function hasAcceptableProtocol(src) {
  const acceptableProtocols = ['http:', 'https:'].join('|');

  const theUrl = url.parse(src);

  if (!theUrl.protocol) {
    return false;
  }
  return new RegExp(acceptableProtocols).test(src);
}

function processSrc(src, options) {
  if (hasAcceptableProtocol(src)) {
    // The protocol is great and okay!
    return src;
  }

  // We need to convert it
  const resolvedSrc = path.resolve(options.assetDir, src);
  return fileUrl(resolvedSrc);
}

function qualifyImgSources(html, options) {
  const $ = cheerio.load(html);

  $('img').each((i, img) => {
    img.attribs.src = processSrc(img.attribs.src, options);
  });

  return $.html();
}

module.exports = {
  getStyleBlock,
  getStyles,
  hasAcceptableProtocol,
  qualifyImgSources,
  processSrc,
};
