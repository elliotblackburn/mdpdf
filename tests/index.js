'use strict';

const should = require('should');
const execa = require('execa');
const fs = require('fs');
const utils = require('./utils');
const mdpdf = require('../');

function clean() {
    const filesToRemove = [
        './README.pdf',
        './README.html',
        './output.pdf'
    ];

    filesToRemove.forEach(file => {
        fs.exists(file, exists => {
            if (exists) {
                fs.unlinkSync(file);
            }
        });
    });
}

describe('Convert CLI', function() {
    this.timeout(10000);

    after(clean);
    beforeEach(clean);

    context('when given a markdown file', function() {
        it('creates a pdf', function(done) {

            execa('./bin/index.js', ['./README.md']).then(function(result) {
                const stdout = result.stdout;
                const pdfExists = fs.existsSync('./README.pdf');

                pdfExists.should.be.true();
                stdout.should.startWith('✨ PDF created successfully at:');
                stdout.should.endWith('README.pdf')
                
                done();
            }).catch(done);
        });
    });

    context('when passed debug flag', function() {
        it('creates a pdf and html file', function(done) {

            execa('./bin/index.js', ['./README.md', '--debug']).then(function(result) {
                const stdout = result.stdout;
                const pdfExists = fs.existsSync('./README.pdf');
                const htmlExists = fs.existsSync('./README.html');

                pdfExists.should.be.true();
                htmlExists.should.be.true();
                stdout.should.startWith('✨ PDF created successfully at:');
                stdout.should.endWith('README.pdf')
                
                done();
            }).catch(done);
        });
    });

    context('when passed a destination', function() {
        it('creates a pdf at the specified destination', function(done) {

            execa('./bin/index.js', ['./README.md', 'output.pdf']).then(function(result) {
                const stdout = result.stdout;
                const pdfExists = fs.existsSync('./output.pdf');

                pdfExists.should.be.true();
                stdout.should.startWith('✨ PDF created successfully at:');
                stdout.should.endWith('output.pdf')
                
                done();
            }).catch(done);
        });
    });
});

describe('Convert API', function() {
    this.timeout(10000);

    after(clean);
    beforeEach(clean);

    context('when given a markdown source', function() {
        it('creates a pdf', function(done) {

            const options = utils.createOptions({
                source: 'README.md'
            });
            mdpdf.convert(options).then(pdfPath => {
                const pdfExists = fs.existsSync('./README.pdf');

                pdfExists.should.be.true();

                done();
            }).catch(done);

        });
    });

    context('when debug is true', function() {
        it('creates a html file', function(done) {

            const options = utils.createOptions({
                source: 'README.md',
                debug: true
            });
            mdpdf.convert(options).then(pdfPath => {
                const pdfExists = fs.existsSync('./README.pdf');
                const htmlExists = fs.existsSync('./README.html');

                pdfExists.should.be.true();
                htmlExists.should.be.true();

                done();
            }).catch(done);

        });
    });

    context('when destination is set', function() {
        it('creates a pdf at the destination', function(done) {

            const options = utils.createOptions({
                source: 'README.md',
                destination: 'output.pdf'
            });
            mdpdf.convert(options).then(pdfPath => {
                const pdfExists = fs.existsSync('./output.pdf');

                pdfExists.should.be.true();

                done();
            }).catch(done);

        });
    });
});