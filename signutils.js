var pkijs = require("pkijs");
var asn1js = require("asn1js");
var pvutils = require('pvutils');

const PDFSIGN = require('./pdfsign').PDFSIGN;

let trustedCertificates = []; // Array of Certificates

const CA64 = "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";

let asn2 = asn1js.fromBER(pvutils.stringToArrayBuffer(pvutils.fromBase64(CA64)));
let CA = new pkijs.Certificate({ schema: asn2.result });
trustedCertificates.push(CA);

function certificateRaw(provider, certID) {
    return Promise.resolve()
        .then(function () {
            return provider.certStorage.getItem(certID)
                .then(function (cert) {
                    return provider.certStorage.exportCert('raw', cert)
                        .then(function (raw) {
                            return raw;
                        });
                });
        });
}

function keyFromCertificateId(type, provider, certID) {
    return Promise.resolve()
        .then(function () {
            return provider.keyStorage.keys()
        })
        .then(function (keyIDs) {
            for (var i = 0; i < keyIDs.length; i++) {
                var keyID = keyIDs[i];
                var parts = keyID.split("-");

                if (parts[0] === type && parts[2] === certID.split("-")[2]) {
                    return provider.keyStorage.getItem(keyID);
                }
            }
            return null;
        })
        .then(function (key) {
            if (key || type !== "public") {
                return key;
            }

            return provider.certStorage.getItem(certID)
                .then(function (cert) {
                    return cert.publicKey;
                });
        });
}

function firstProvider(ws) {
    return listProviders(ws).then((providers) => {
        if (providers.length > 0)
            return ws.getCrypto(providers[0]);
        else
            throw new Error("Tokens no encontrados");
    });
}

function listProviders(ws) {
    return ws.info()
        .then(function (info) {
            let providers = [];
            for (let i = 0; i < info.providers.length; i++) {
                const provider = info.providers[i];
                if (provider.isHardware)
                    providers.push(provider.id);
            }
            return providers;
        });
}

function listCertificates(provider) {
    let certIDs, keyIDs;
    return Promise.resolve()    // Habilitar en el navegador
        .then(function () {
            if (typeof provider.isLoggedIn == "function") {
                return provider.isLoggedIn()
                    .then(function (ok) {
                        if (ok)
                            return provider.logout();
                    }).then(() => {
                        return provider.login();
                    });
            }
        })
        .then(function () {
            return provider.certStorage.keys()
        })
        .then(function (indexes) {
            certIDs = indexes.filter(function (id) {
                var parts = id.split("-");
                return parts[0] === "x509";
            });
        })
        .then(function () {
            return provider.keyStorage.keys()
        })
        .then(function (indexes) {
            keyIDs = indexes.filter(function (id) {
                var parts = id.split("-");
                return parts[0] === "private";
            });
        })
        .then(function () {
            var certificates = [];
            for (var i = 0; i < certIDs.length; i++) {
                var certID = certIDs[i];
                for (var j = 0; j < keyIDs.length; j++) {
                    var keyID = keyIDs[j];
                    if (keyID.split("-")[2] === certID.split("-")[2]) {
                        certificates.push(certID);
                        break;
                    }
                }
            }
            return certificates;
        });
}

function createCMSSigned(data, certSimpl, key) {

    let cmsSignedSimpl = new pkijs.SignedData({
        version: 1,
        encapContentInfo: new pkijs.EncapsulatedContentInfo({
            eContentType: "1.2.840.113549.1.7.1" // "data" content type
        }),
        digestAlgorithms: [],
        signerInfos: [
            new pkijs.SignerInfo({
                version: 1,
                sid: new pkijs.IssuerAndSerialNumber({
                    issuer: certSimpl.issuer,
                    serialNumber: certSimpl.serialNumber
                })
            })
        ],
        certificates: [certSimpl]
    });

    //TODO: añadir extensiones
    return cmsSignedSimpl.sign(key, 0, "sha-256", data).then(() => { // SHA-256 por defecto
        var cmsSignedSchema = cmsSignedSimpl.toSchema(true);
        var cmsContentSimp = new pkijs.ContentInfo({
            contentType: '1.2.840.113549.1.7.2',
            content: cmsSignedSchema
        });
        var _cmsSignedSchema = cmsContentSimp.toSchema(true);
        _cmsSignedSchema.lenBlock.isIndefiniteForm = true;

        var block1 = _cmsSignedSchema.valueBlock.value[1];
        block1.lenBlock.isIndefiniteForm = true;

        var block2 = block1.valueBlock.value[0];
        block2.lenBlock.isIndefiniteForm = true;
        var cmsSignedBuffer = _cmsSignedSchema.toBER(false);
        var cmsSignedHex = pvutils.bufferToHexCodes(cmsSignedBuffer);

        return cmsSignedHex;
    });
}

function signpdf(pdfRaw, key, certificate) {
    return PDFSIGN.signpdfEmpty(pdfRaw, pkijs.getEngine()).then(([pdf, byteRange]) => {
        let data = PDFSIGN._removeFromArray(pdf, byteRange[1], byteRange[2]);
        return createCMSSigned(data, certificate, key).then((signature) => { // hex
            return PDFSIGN._updateArray(pdf, byteRange[1] + 1, signature);
        });
    });
}

function listSigFields(pdf) {
    const sigFields = [];

    const acroForm = pdf.xref.root.get("AcroForm");
    if(typeof acroForm === "undefined")
        throw new Error("El PDF no tiene firmas!");

    const fields = acroForm.get("Fields");
    // TODO
    // if(window.isRef(fields[0]) === false)
    //      throw new Error("Wrong structure of PDF!");
    for (let i = 0; i< fields.length; i++) {
        const sigField = pdf.xref.fetch(fields[i]);
        const sigFieldType = sigField.get("FT");
        if((typeof sigFieldType === "undefined") || (sigFieldType.name !== "Sig"))
            // throw new Error("Wrong structure of PDF!");
            continue; //Ignorar Tx o Btn
        sigFields.push(sigField);
    }

    if (sigFields.length == 0)
        throw new Error("El PDF no tiene firmas!");

    return sigFields;
}

async function createOCSPReq(serialNumbers) {

    if (!(serialNumbers instanceof Array))
        serialNumbers = [serialNumbers];

    let extension = CA.extensions.find((extension) => {
        return extension.extnID == "2.5.29.14";
    });
    let issuerKeyHash = extension.parsedValue.valueBlock.valueHex;
    let issuerNameHash = await pkijs.getCrypto().subtle.digest('SHA-1', CA.subject.valueBeforeDecode);

    const ocspReq = new pkijs.OCSPRequest();
    let requestList = [];

    serialNumbers.forEach(serialNumber => {
        requestList.push(new pkijs.Request({
	        reqCert: new pkijs.CertID({
		        hashAlgorithm: new pkijs.AlgorithmIdentifier({
			        algorithmId: "1.3.14.3.2.26"
		        }),
		        issuerNameHash: new asn1js.OctetString({ valueHex: issuerNameHash }),
		        issuerKeyHash: new asn1js.OctetString({ valueHex: issuerKeyHash }),
		        serialNumber: new asn1js.Integer({ valueHex: serialNumber}) // cert.serialNumber.valueBlock.valueHex
	        })
        }));
    });

    ocspReq.tbsRequest.requestList = requestList;
    return ocspReq;
};

async function listSignatures(pdf, ocspReq) {
    const result = {data:[]};
    pdf = PDFSIGN.parsePDF(pdf);

    const sigFields = listSigFields(pdf);
    let serialNumbers = [];
    for (let i in sigFields) {
        let data = {};
        let sigField = sigFields[i];
        let v = sigField.get("V");
        let byteRange = v.get("ByteRange");
        let contents = v.get("Contents");

        let contentBuffer = pvutils.stringToArrayBuffer(contents);

        let asn1 = asn1js.fromBER(contentBuffer);
        let cmsContentSimp = new pkijs.ContentInfo({ schema: asn1.result });
        let cmsSignedSimp = new pkijs.SignedData({ schema: cmsContentSimp.content });

        let certificate = cmsSignedSimp.certificates[0];

        data.numeroSerie = pvutils.bufferToHexCodes(certificate.serialNumber.valueBlock.valueHex);
        serialNumbers.push(certificate.serialNumber.valueBlock.valueHex);

        let subFilter = v.get("SubFilter");
        let filter = v.get("Filter");
        data.subFilter = subFilter.name.toUpperCase();


        // Fecha de la firma desde el documento PDF
        // TODO: mejorar
        var date = v.get("M");
        var pattern = /D:(\d{4})(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})-0(\d{1})'00'/;

        if (date != undefined)
            data.fechaFirma = date.replace(pattern, '$3/$2/$1 $4:$5:$6');

        // Limpiar Campo de la firma
        let signedDataBuffer = PDFSIGN._removeFromArray(pdf.stream.bytes,
                                                        byteRange[1],
                                                        byteRange[2]);
        // Limpiar datos
        signedDataBuffer = PDFSIGN._removeFromArray(signedDataBuffer,
                                                    byteRange[1]+byteRange[3],
                                                    signedDataBuffer.length);

        data.autenticidad = await cmsSignedSimp.verify({signer: 0, data: signedDataBuffer,
                                                        trustedCertificates: trustedCertificates});

        data.cadenaConfianza = await certificate.verify(trustedCertificates[0]);
        // data.certificado = pvutils.toBase64(pvutils.arrayBufferToString(certificate.tbs));
        data.certificado = certificate;
        data.ocsp_estado = 2; // Desconocido por defecto.
        result.data.push(data);
    }

    let ocspReqBuffer = (await createOCSPReq(serialNumbers)).toSchema(true).toBER(false);

    if (ocspReq != undefined && typeof ocspReq == 'function'){
        try {
            [statusCode, ocspResBuffer] = await ocspReq(ocspReqBuffer);

            const asn1 = asn1js.fromBER(ocspResBuffer);
            const ocspRespSimpl = new pkijs.OCSPResponse({ schema: asn1.result });
            let ocspBasicResp;

            if (ocspRespSimpl.responseStatus.valueBlock.valueDec == 0) { // usar !=
                if("responseBytes" in ocspRespSimpl) {
                    const asn1Basic = asn1js.fromBER(ocspRespSimpl.responseBytes.response.
                                                     valueBlock.valueHex);
		            ocspBasicResp = new pkijs.BasicOCSPResponse({ schema: asn1Basic.result });
                    if (serialNumbers.length != ocspBasicResp.tbsResponseData.responses.length) {
                        // ERROR
                    }
                    for(let i = 0; i < ocspBasicResp.tbsResponseData.responses.length; i++)
	                {
                        const typeval = pvutils.bufferToHexCodes(ocspBasicResp.tbsResponseData.responses[i].
                                                                 certID.serialNumber.valueBlock.valueHex);
                        let subjval = ocspBasicResp.tbsResponseData.responses[i].certStatus.idBlock.tagNumber;

                        let data = result.data.find((data) => {
                            return data.numeroSerie == typeval;
                        });
                        if (data)
                            data.ocsp_estado = subjval;

                        if (subjval == 1) {
                            data.ocsp_fechaRevocacion = ocspBasicResp.tbsResponseData.
                                responses[i].certStatus.valueBlock.value[0].toDate()
                        }
                        data.ocsp_fechaActualizacion = ocspBasicResp.tbsResponseData.responses[i].thisUpdate;
                    }

                } else {
                    // ERROR
                }
            }
        } catch(err) {
            // OCSP no disponible
            console.log("OCSP no disponible:", err);
        }
    }

    return result;
}

function firstCertificate(provider) {
    let certRaw;
    let certID;

    let sequence = listCertificates(provider).then((certificados) => {
        if (certificados.length >0) {
            // Seleccionar el primer certificado
            certID = certificados[0];
            return certificateRaw(provider, certID);
        } else
            throw new Error("No hay certificados.");
    });

    sequence = sequence.then((raw) => {
        certRaw = raw;
        return keyFromCertificateId("private", provider, certID);
    });

    sequence = sequence.then((key) => {
        if (!key)
            throw new Error("Certificado no tiene llave privada.");


        const certSimpl = asn1js.fromBER(certRaw);
        const certificate = new pkijs.Certificate({ schema: certSimpl.result });

        return [key, certificate];
    });
    return sequence;
}

function setEngine(nombre, provider) {
    pkijs.setEngine(nombre, provider, new pkijs.CryptoEngine({name: 'local', crypto: provider, subtle: provider.subtle}));
}

exports.listCertificates = listCertificates;
exports.listProviders = listProviders;
exports.keyFromCertificateId = keyFromCertificateId;
exports.certificateRaw = certificateRaw;
exports.createCMSSigned = createCMSSigned;
exports.signpdf = signpdf;

exports.listSignatures = listSignatures;
exports.firstCertificate = firstCertificate;
exports.firstProvider = firstProvider;
exports.setEngine = setEngine;
