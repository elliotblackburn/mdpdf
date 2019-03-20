function getOptions(options) {
  let displayHeaderFooter = false;
  if (options.header || options.footer) {
    displayHeaderFooter = true;
  }

  let margin = {};
  if (options.pdf.border) {
    margin.top = options.pdf.border.top || undefined;
    margin.right = options.pdf.border.right || undefined;
    margin.bottom = options.pdf.border.bottom || undefined;
    margin.left = options.pdf.border.left || undefined;
  }

  return {
    path: options.destination,
    displayHeaderFooter: false,
    printBackground: true,
    format: options.pdf.format,
    margin,
    displayHeaderFooter,
    headerTemplate: options.header || '',
    footerTemplate: options.footer || '',
  };
}

module.exports = {
  getOptions,
};
