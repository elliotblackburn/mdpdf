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

  let pupOptions = {
    path: options.destination,
    displayHeaderFooter: false,
    printBackground: true,
    format: options.pdf.format,
    margin,
    displayHeaderFooter,
    headerTemplate: options.header || '',
    footerTemplate: options.footer || '',
  }

  if(options.pdf.orientation=='landscape')
    pupOptions['landscape'] = true;

  return pupOptions;
}

module.exports = {
  getOptions,
};
