const wcp11 = require("node-webcrypto-p11");
const pkijs = require("pkijs");
const asn1js = require("asn1js");
const fs = require('fs');
const pvutils = require('pvutils');
const pdfsign = require('../index');

var PDFDocument = require("./simple/src/pdf.worker.min").PDFDocument;

pdfsign.setPDFDocument(PDFDocument);

const config = {
    library: "/usr/lib/opensc-pkcs11.so", // /usr/lib/opensc-pkcs11.so, /usr/lib/libsofthsm2.so
    name: "SoftHSM lib",                  // OpenSC lib, SoftHSM lib
    slot: 0,
    readWrite: true,
    pin: "123456"
};

let sequence = Promise.resolve();

sequence = sequence.then(()=> {
    return new wcp11.WebCrypto(config);
});

var pdfBuffer = fs.readFileSync("./simple/mini.pdf");
pdfBuffer = new Uint8Array(pdfBuffer);

sequence = sequence.then((provider) => {
    let certificateRaw;
    let certID;
    pkijs.setEngine('local', provider, new pkijs.CryptoEngine({name: 'local', crypto: provider, subtle: provider.subtle}));
    return pdfsign.primerCertificado(provider);
});

sequence.then(async ([key, certificate]) => {
    // Lectura PDF
    pdfBuffer = pdfBuffer;

    pdfBuffer = await pdfsign.firmarPDF(pdfBuffer, key, certificate); // Firma
    guardarPDF(pdfBuffer);
});

function guardarPDF(pdfBuffer) {
    fs.writeFileSync('./out.pdf', pdfBuffer); // Guardado PDF
}
