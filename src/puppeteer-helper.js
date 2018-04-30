function getOptions(options) {
  let displayHeaderFooter = false;
  if (options.header || options.footer) {
    displayHeaderFooter = true;
  }

  return {
    path: options.destination,
    displayHeaderFooter: false,
    printBackground: true,
    format: options.pdf.format,
    margin: {
      top: options.pdf.border.top,
      right: options.pdf.border.right,
      bottom: options.pdf.border.bottom,
      left: options.pdf.border.left,
    },
    displayHeaderFooter,
    headerTemplate: options.header || '',
    footerTemplate: options.footer || '',
  };
}

module.exports = {
  getOptions,
};
