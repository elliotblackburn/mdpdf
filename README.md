# MDPDF - Markdown to PDF converter

This is a command line markdown to pdf converter with support for page headers and footers. It's designed to be very configurable and take a custom stylesheet. Bundle the stylesheet and package with your project and let anyone generate the same PDF of your document.

## Installation

Install globally to use from the command line.

`npm install mdpdf -g`

Install locally to access the API.

`npm install mdpdf --save`

## Simple usage

`mdpdf --source README.md`

## Complex usage

`mdpdf --source README.md --style styles.css --header header.hbs --headerHeight 22 --debug`

## Options

### Required

* `--source` The source markdown file with one of the following extensions: .md, .markdown, .mkd, .mkdown

### Optional
* `--style` A single css stylesheet you wish to apply to the PDF
* `--header` A handlebars (.hbs) file to inject into the header of the PDF
* `--headerHeight` The height of the header section in mm, this might take some fiddling to get just right.
* `--debug` Mdpdf converts the markdown into html before making a pdf, this saves out the html as well as the pdf.
* `--help` The argument help menu