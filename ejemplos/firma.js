require("babel-polyfill");

const {PDFDocument} = require("../node_modules/pdfjs-dist/lib/core/document");
const wcp11 = require("node-webcrypto-p11");
const pkijs = require("pkijs");
const asn1js = require("asn1js");
const fs = require('fs');
const pvutils = require('pvutils');
const pdfsign = require('../');

pdfsign.setPDFDocument(PDFDocument);

const config = {
    library: "/usr/lib/opensc-pkcs11.so", // /usr/lib/opensc-pkcs11.so, /usr/lib/libsofthsm2.so
    name: "SoftHSM lib",                  // OpenSC lib, SoftHSM lib
    slot: 0,
    readWrite: true,
    pin: "12345678"
};

let sequence = Promise.resolve();

sequence = sequence.then(()=> {
    return new wcp11.WebCrypto(config);
});

var pdfBuffer = fs.readFileSync("./simple/mini.pdf");
pdfBuffer = new Uint8Array(pdfBuffer);

sequence = sequence.then((provider) => {
    pdfsign.setEngine("p11", provider);
    return pdfsign.firstCertificate(provider);
});

sequence.then(async ([key, certificate]) => {

    pdfBuffer = await pdfsign.signpdf(pdfBuffer, key, certificate); // Firma
    guardarPDF(pdfBuffer);
}).catch((err) => {
    console.error(err);
});

function guardarPDF(pdfBuffer) {
    fs.writeFileSync('./out.pdf', pdfBuffer); // Guardado PDF
}
