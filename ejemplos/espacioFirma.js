require("babel-polyfill");

const {PDFDocument} = require("../node_modules/pdfjs-dist/lib/core/document");
const WebCrypto = require("node-webcrypto-ossl");
const pdfsign = require('../');
const pkijs = require("pkijs");
const fs = require('fs');

pdfsign.setPDFDocument(PDFDocument);

let sequence = Promise.resolve();

sequence = sequence.then(()=> {
    return new WebCrypto();
});

sequence = sequence.then((provider) => {
    pdfsign.setEngine("ossl", provider);

    // Generar espacio para firma digital en un PDF.
    var pdfBuffer = fs.readFileSync("./simple/mini.pdf");
    pdfBuffer = new Uint8Array(pdfBuffer);
    return pdfsign.signpdfEmpty(pdfBuffer, pkijs.getEngine());
});

sequence.then(([pdf, byteRange]) => {
    fs.writeFileSync('./out.pdf', pdf);
}).catch((err) => {
    console.error(err);
});
