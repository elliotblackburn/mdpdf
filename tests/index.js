const fs = require('fs');
const should = require('should');
const execa = require('execa');
const mdpdf = require('../');
const utils = require('./utils');

function clean() {
  const filesToRemove = ['./README.pdf', './README.html', './output.pdf', './test-img-output.pdf'];

  filesToRemove.forEach(file => {
    fs.exists(file, exists => {
      if (exists) {
        try {
          fs.unlinkSync(file);
        } catch (err) {
          console.error('Failed to unlink file', file, err);
        }
      }
    });
  });
}

describe('Convert CLI', function() {
  this.timeout(50000);

  after(clean);
  beforeEach(clean);

  context('when given a markdown file', () => {
    it('creates a pdf', done => {
      execa('./bin/index.js', ['./README.md'])
        .then(result => {
          const stdout = result.stdout;
          const pdfExists = fs.existsSync('./README.pdf');

          pdfExists.should.be.true();
          stdout.should.endWith('README.pdf');

          done();
        })
        .catch(done);
    });
  });

  context('when passed debug flag', () => {
    it('creates a pdf and html file', done => {
      execa('./bin/index.js', ['./README.md', '--debug'])
        .then(result => {
          const stdout = result.stdout;
          const pdfExists = fs.existsSync('./README.pdf');
          const htmlExists = fs.existsSync('./README.html');

          pdfExists.should.be.true();
          htmlExists.should.be.true();
          stdout.should.endWith('README.pdf');

          done();
        })
        .catch(done);
    });
  });

  context('when passed a destination', () => {
    it('creates a pdf at the specified destination', done => {
      execa('./bin/index.js', ['./README.md', 'output.pdf'])
        .then(result => {
          const stdout = result.stdout;
          const pdfExists = fs.existsSync('./output.pdf');

          pdfExists.should.be.true();
          stdout.should.endWith('output.pdf');

          done();
        })
        .catch(done);
    });
  });

  context('when given markdown with an image', () => {
    it('creates a pdf', done => {
      execa('./bin/index.js', ['./tests/test.md', './test-img-output.pdf'])
        .then(result => {
          const stdout = result.stdout;
          const pdfExists = fs.existsSync('./test-img-output.pdf');

          pdfExists.should.be.true();
          stdout.should.endWith('test-img-output.pdf');

          done();
        })
        .catch(done);
    });
  });

  context('When custom style is passed', () => {
    it('HTML file contains the custom style', done => {
      execa('./bin/index.js', ['./tests/test.md', '--style=./tests/test.css', '--debug'])
        .then(() => {
          const htmlContent = fs.readFileSync('./tests/test.html');
          const cssContent = fs.readFileSync('./tests/test.css');
          const ghStyleContent = fs.readFileSync('./src/assets/github-markdown-css.css');

          htmlContent.includes(cssContent).should.be.true();
          htmlContent.includes(ghStyleContent).should.be.false();
          done();
        });
    });

    it('HTML file contains the default styles when --gh-style is passed', done => {
      execa('./bin/index.js', ['./tests/test.md', '--style=./tests/test.css', '--debug', '--gh-style'])
        .then(() => {
          const htmlContent = fs.readFileSync('./tests/test.html');
          const cssContent = fs.readFileSync('./tests/test.css');
          const ghStyleContent = fs.readFileSync('./src/assets/github-markdown-css.css');

          htmlContent.includes(cssContent).should.be.true();
          htmlContent.includes(ghStyleContent).should.be.true();
          done();
        });
    });
  });
});

describe('Convert API', function() {
  this.timeout(10000);

  after(clean);
  beforeEach(clean);

  context('when given a markdown source', () => {
    it('creates a pdf', done => {
      const options = utils.createOptions({
        source: 'README.md',
      });
      mdpdf
        .convert(options)
        .then(pdfPath => {
          const pdfExists = fs.existsSync('./README.pdf');

          pdfExists.should.be.true();

          done();
        })
        .catch(done);
    });
  });

  context('when debug is true', () => {
    it('creates a html file', done => {
      const options = utils.createOptions({
        source: 'README.md',
        debug: true,
      });
      mdpdf
        .convert(options)
        .then(pdfPath => {
          const pdfExists = fs.existsSync('./README.pdf');
          const htmlExists = fs.existsSync('./README.html');

          pdfExists.should.be.true();
          htmlExists.should.be.true();

          done();
        })
        .catch(done);
    });
  });

  context('when destination is set', () => {
    it('creates a pdf at the destination', done => {
      const options = utils.createOptions({
        source: 'README.md',
        destination: 'output.pdf',
      });
      mdpdf
        .convert(options)
        .then(pdfPath => {
          const pdfExists = fs.existsSync('./output.pdf');

          pdfExists.should.be.true();

          done();
        })
        .catch(done);
    });
  });
});
