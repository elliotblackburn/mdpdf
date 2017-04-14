const path = require('path');
const mdpdf = require('../../');

// Create the options object as required
const options = {
	source: path.join(__dirname, 'md-file.md'),
	destination: path.join(__dirname, 'pdf-file.pdf'),
	ghStyle: true,
	defaultStyle: true,
	footer: path.join(__dirname, 'footer.hbs'),
	header: path.join(__dirname, 'header.hbs'),
	pdf: {
		format: 'A4',
		quality: '100',
		header: {
			height: '20mm'
		},
		footer: {
			height: '20mm'
		},
		border: {
			top: '10mm',
			left: '10mm',
			bottom: '10mm',
			right: '10mm'
		}
	}
};

// Call convert which returns a thenable promise with the pdfPath
mdpdf.convert(options).then(pdfPath => {
	console.log('PDF Path:', pdfPath);
}).catch(err => {
    // Don't forget to handle errors
	console.error(err);
});
