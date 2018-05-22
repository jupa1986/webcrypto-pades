require("babel-polyfill");

const {PDFDocument} = require("../node_modules/pdfjs-dist/lib/core/document");
const WebCrypto = require("node-webcrypto-ossl");
const wcp11 = require("node-webcrypto-p11");
const streams = require('memory-streams');
const pdfsign = require("../");
const request = require("request");
const pkijs = require("pkijs");
const fs = require("fs");

// Webcrypto: PKCS11
const config = {
    library: "/usr/lib/opensc-pkcs11.so", // /usr/lib/opensc-pkcs11.so, /usr/lib/libsofthsm2.so
    name: "SoftHSM lib",                  // OpenSC lib
    slot: 0,
    readWrite: true,
    pin: "12345678"
};

pdfsign.setPDFDocument(PDFDocument);

let sequence = Promise.resolve();
sequence = sequence.then(()=> {
    return new wcp11.WebCrypto(config);
});

let pdfBuffer = fs.readFileSync("./simple/mini.pdf");
pdfBuffer = new Uint8Array(pdfBuffer);

sequence = sequence.then((provider) => {
    pdfsign.setEngine("p11", provider);

    return pdfsign.firstCertificate(provider).then(async ([key, certificate]) => {
        pdfBuffer = await pdfsign.signpdf(pdfBuffer, key, certificate);
        return pdfBuffer;
    });
});

sequence.then((pdfBuffer) => {
    pdfsign.setEngine("ossl", new WebCrypto());

    return pdfsign.listSignatures(pdfBuffer, HTTPOCSPRequest).then((result) => {
        console.log(result);
    });
}).catch((err) => {
    console.log(err);
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
                console.log(res.statusCode);
                let ocspResBuffer = new Uint8Array(writeStream.toBuffer()).buffer;
                resolve([res.statusCode, ocspResBuffer]);
            } else {
                reject(err);
            }
        }).pipe(writeStream);
    });
};
