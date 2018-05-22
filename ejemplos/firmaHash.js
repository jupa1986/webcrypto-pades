require("babel-polyfill");

const {PDFDocument} = require("../node_modules/pdfjs-dist/lib/core/document");
const wcp11 = require("node-webcrypto-p11");
const WebCrypto = require("node-webcrypto-ossl");
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
    return new WebCrypto();
});

var byteRange;
var pdfBuffer = fs.readFileSync("./simple/mini.pdf");
pdfBuffer = new Uint8Array(pdfBuffer);

// Server
sequence = sequence.then((provider) => {
    pdfsign.setEngine("ossl", provider);

    return pdfsign.signpdfEmpty(pdfBuffer, pkijs.getEngine()).then(([pdf, range]) => {
        // Guardar pdf prefirmado, y byteRange
        pdfBuffer = pdf;
        byteRange = range;

        return pdfsign.pdfHash(pdf, byteRange); // ArrayBuffer -> hex ?
    })
});

// Client
sequence = sequence.then((hash) => { // hex -> ArrayBuffer ?
    return firstProvider().then((provider) => {
        pdfsign.setEngine("p11", provider);

        return pdfsign.firstCertificate(provider);
    }).then(([key, certificate]) => {
        return pdfsign.createCMSSigned(hash, certificate, key);
    });
});

// Server
sequence.then((signature) => {
    // TODO: Verify signature
    let pdfSigned = pdfsign.updateArray(pdfBuffer, byteRange[1] + 1, signature);
    // Save
    fs.writeFileSync('./out.pdf', pdfBuffer); // Guardado PDF
    console.log("OK");
});

// Error
sequence.catch((err) => {
    console.error(err);
});

// tmp pdfsign.firstProvider
async function firstProvider(/*ws*/) {
    return new wcp11.WebCrypto(config);
}
