import { resolve, dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export function createOptions(options) {
  const source = options.source;
  const destination =
    options.destination || source.slice(0, source.indexOf('.md')) + '.pdf';
  const debug = options.debug || false;

  return {
    ghStyle: true,
    defaultStyle: true,
    source: resolve(source),
    destination: resolve(destination),
    assetDir: dirname(resolve(source)),
    styles: null,
    header: null,
    debug: debug ? source.slice(0, source.indexOf('.md')) + '.html' : null,
    pdf: {
      format: 'A4',
      orientation: 'portrait',
      base: join('file://', __dirname, '/assets/'),
      header: {
        height: null,
      },
      border: {
        top: '10mm',
        left: '10mm',
        bottom: '10mm',
        right: '10mm',
      },
    },
  };
}
