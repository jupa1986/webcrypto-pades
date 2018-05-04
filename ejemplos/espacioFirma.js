const PDFDocument = require("./simple/src/pdf.worker.min").PDFDocument;
const WebCrypto = require("node-webcrypto-ossl");
const pdfsign = require('../index');
const pkijs = require("pkijs");
const fs = require('fs');

pdfsign.setPDFDocument(PDFDocument);

let sequence = Promise.resolve();

sequence = sequence.then(()=> {
    return new WebCrypto();
});

sequence = sequence.then((provider) => {
    let subtle = new pkijs.CryptoEngine({name: 'ossl',
                                         crypto: provider,
                                         subtle: provider.subtle});
    pkijs.setEngine("ossl", provider, subtle);

    // Generar espacio para firma digital en un PDF.
    var pdfBuffer = fs.readFileSync("./simple/mini.pdf");
    pdfBuffer = new Uint8Array(pdfBuffer);
    return pdfsign.espacioFirma(pdfBuffer, pkijs.getEngine());
});

sequence.then(([pdf, byteRange]) => {
    console.log("byteRange:", byteRange);
    fs.writeFileSync('./out_s.pdf', pdf); // Guardado PDF
    console.log("OK");
});
