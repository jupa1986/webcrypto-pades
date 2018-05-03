const WebCrypto = require("node-webcrypto-ossl");
const wcp11 = require("node-webcrypto-p11");
const streams = require('memory-streams');
const pdfsign = require("../index");
const request = require("request");
const pkijs = require("pkijs");
const fs = require("fs");

// Webcrypto: PKCS11
const config = {
    library: "/usr/lib/opensc-pkcs11.so", // /usr/lib/opensc-pkcs11.so, /usr/lib/libsofthsm2.so
    name: "SoftHSM lib",                  // OpenSC lib
    slot: 0,
    readWrite: true,
    pin: "123456"
};

var PDFDocument = require("./simple/src/pdf.worker.min").PDFDocument;
pdfsign.setPDFDocument(PDFDocument);

let sequence = Promise.resolve();
sequence = sequence.then(()=> {
    return new wcp11.WebCrypto(config);
});
let pdfBuffer = fs.readFileSync("./simple/mini.pdf");
pdfBuffer = new Uint8Array(pdfBuffer);

sequence = sequence.then((provider) => {
    pkijs.setEngine('local', provider, new pkijs.CryptoEngine({name: 'local', crypto: provider, subtle: provider.subtle}));
    return pdfsign.primerCertificado(provider).then(async ([key, certificate]) => {
        pdfBuffer = await pdfsign.firmarPDF(pdfBuffer, key, certificate);
        fs.writeFileSync('./out.pdf', pdfBuffer); // Guardado PDF
    });
});

sequence.then(() => {
    let pdfRaw = fs.readFileSync("./out.pdf");
    pdfRaw = new Uint8Array(pdfRaw);
    let webcrypto = new WebCrypto();
    let subtle = new pkijs.CryptoEngine({name: 'ossl',
                                         crypto: webcrypto,
                                         subtle: webcrypto.subtle});
    pkijs.setEngine("ossl", webcrypto, subtle);
    return pdfsign.listarFirmas(pdfRaw, HTTPOCSPRequest).then((result) => {
        console.log(result);
    }).catch((err) => {
        console.log(err);
    });
});

function HTTPOCSPRequest(ocspReqBuffer) {
    let writeStream = new streams.WritableStream();
    options = {
        url: "http://firmadigital.bo/ocsp/", // static OCSP url
        method: 'POST',
        contentType: 'application/ocsp-request',
        body: Buffer.from(ocspReqBuffer),
        timeout: 5000           // 5s
    };

    return new Promise((resolve, reject) => {
        request(options, (err, res) => {
            if(!err) {
                let ocspResBuffer = new Uint8Array(writeStream.toBuffer()).buffer;
                resolve([res.statusCode, ocspResBuffer]);
            } else {
                reject(err);
            }
        }).pipe(writeStream);
    });
};
