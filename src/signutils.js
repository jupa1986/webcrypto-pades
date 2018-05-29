import * as pkijs from "pkijs";
import * as asn1js from "asn1js";
import * as pvutils from "pvutils";
import * as pdfsign from "./pdfsign.js"
import { SigningCertificateV2, ESSCertIDv2 } from "cadesjs"

let trustedCertificates = []; // Array of Certificates

const CA64 = "MIIGlzCCBH+gAwIBAgIIDVNUG1JQENowDQYJKoZIhvcNAQELBQAwSzEuMCwGA1UEAwwlRW50aWRhZCBDZXJ0aWZpY2Fkb3JhIFJhaXogZGUgQm9saXZpYTEMMAoGA1UECgwDQVRUMQswCQYDVQQGEwJCTzAeFw0xNjA0MDgxOTU0MDlaFw0yNjA0MDkxOTU0MDlaMEsxLDAqBgNVBAMMI0VudGlkYWQgQ2VydGlmaWNhZG9yYSBQdWJsaWNhIEFEU0lCMQ4wDAYDVQQKDAVBRFNJQjELMAkGA1UEBhMCQk8wggIiMA0GCSqGSIb3DQEBAQUAA4ICDwAwggIKAoICAQDIQGzLQDJP3JGZP8jtFxp3iMliw4yhx3b6n53e4Qqo8p229UqI5nuDxSY/sxpH6SZGCpbu+33wGhI/5MHrLZEW1GJ/UTNkRhbtJhhcWkYXovRp9MQ9HW14vIatjXJLzXErKGqsmTBPd9M56IYOoskh5i+6wn+kofBpDqSeoMP5bh3GdH6q+D34KjuTPclnDLlztspTQa4p0VxRkdzBekPRghU3D7RbtYycGgRrfwoRrxRol+9L+Wk1VYQ3rtAKwc2A2lm2FqX1LbKaI3RUpzyvNL/9mSRt9bdTx4CryQQRKD8MqbBB1sQRXgjAx3ACan9wTCt8ck1gBdDzALFX7w/GwZiScsbjcu0+2ZZyfqxCzmkWqysoZ/qgNbHD0HCADDaxOgONxiL1jkU2ATejuM3rkLPoojydKBO0/d7cLSguYJeesZIONhlPzMGfINNsPplSPSdNLdtYpD+xDmviagdm4/m7oAIFarMOudD3PPCTHfGM4ZIFM4+/GI9JqqgYyD1kRlsPWETCT+rexrQ+snxnYgA2JxH7CJWRpjT2LWB8Fznv2c9r91wPQ0avmodusP7c1FprA6GQO+nmmuCKXuU+ts6sPFuQIeKunpEy0nEFYukvtLwOsT0gPSt5RgfmC80nLFt1yJNqbGOrAPDbvXJFjMXQbPlfZ/WjS4lsW3wUkwIDAQABo4IBfTCCAXkwQwYIKwYBBQUHAQEENzA1MDMGCCsGAQUFBzAChidodHRwczovL2VjcmIuYXR0LmdvYi5iby9lY3JiLmNhY2VydC5wZW0wHQYDVR0OBBYEFNKZ3cFvJS4nqAvr3NnWkltiVaDCMA8GA1UdEwQIMAYBAf8CAQAwHwYDVR0jBBgwFoAUoL9bVHaFJic5r9T5yu37yHC4jBYwTAYDVR0gBEUwQzBBBg1gRAAAAAEOAQIAAAAAMDAwLgYIKwYBBQUHAgEWImh0dHBzOi8vZWNyYi5hdHQuZ29iLmJvL3BjZWNyYi5wZGYwgYUGA1UdHwR+MHwweqAnoCWGI2h0dHBzOi8vZWNyYi5hdHQuZ29iLmJvL2NybGVjcmIuY3Jsok+kTTBLMS4wLAYDVQQDDCVFbnRpZGFkIENlcnRpZmljYWRvcmEgUmFpeiBkZSBCb2xpdmlhMQwwCgYDVQQKDANBVFQxCzAJBgNVBAYTAkJPMAsGA1UdDwQEAwIBBjANBgkqhkiG9w0BAQsFAAOCAgEAVdEINfGVBN5w1YMKcayKgxuX56IEhw2yjGDehKjvA8nOVoCM1j7WW3SwlOO29CpTfAHUmNJRvqdMTlUus9pYyw5BERapEoE9ZQpEmorGj8FbJjCs4hTgc67TQ0KJVWPbnMsu5wobCmv4hq/PZDr2daXA9bFNyvbNcjpea4mVC8WG5lqdflXeI6CHK91GMpw4UGSPqR7rrQj1VUqElyAAzN4PUXW83odDq6pRF7MNKr4LeI8xVL3pvLHAxrrq7dDRG807FzYjXpgKcLrExkNtZPGe4tLI1cvaxVffaPgoYyI5nbjHQDnJhCdrrugAC9xxNq1t17yO0S8wFwgs9JWcIU/8ScE54ht9cz0VneAj6yZGUziwGVRYFwhOMUtrzDdeNZW3+yhzUVasU2EZTa5z+/EWHLZDvrjWTMcyMHETquDtj/lCQHlQGzUwu+DwKedxssIVxDO/voO9wrnllqoiN8OwbSN1/LledKCtYD4h6U3M74NOcvudegeshPjdKGTYAz39jsEX+qx+kOQuMzeisYv0E7aXzkpyxZIVfOP9TWspof+K0whcEGsKwaBSu7x8sxV2rFqbF59KNSgE5RSMCXGb5QPuh0NlZ0oh8QaUrPMhNA03kzRMerMWWx94ymJ7AvUdOxg03I7WJGPTlAbJRXXL07PkIFhe04ow7MCS8Bc=";

let asn2 = asn1js.fromBER(pvutils.stringToArrayBuffer(pvutils.fromBase64(CA64)));
let CA = new pkijs.Certificate({ schema: asn2.result });
trustedCertificates.push(CA);
let hashAlg = "SHA-256";

export function certificateRaw(provider, certID) {
    return Promise.resolve()
        .then(() => {
            return provider.certStorage.getItem(certID)
                .then((cert) => {
                    return provider.certStorage.exportCert('raw', cert)
                        .then((raw) => {
                            return raw;
                        });
                });
        });
}

export function keyFromCertificateId(type, provider, certID) {
    return Promise.resolve()
        .then(() => {
            return provider.keyStorage.keys()
        })
        .then((keyIDs) => {
            for (var i = 0; i < keyIDs.length; i++) {
                var keyID = keyIDs[i];
                var parts = keyID.split("-");

                if (parts[0] === type && parts[2] === certID.split("-")[2]) {
                    return provider.keyStorage.getItem(keyID);
                }
            }
            return null;
        })
        .then((key) => {
            if (key || type !== "public") {
                return key;
            }

            return provider.certStorage.getItem(certID)
                .then((cert) => {
                    return cert.publicKey;
                });
        });
}

export function firstProvider(ws) {
    return listProviders(ws).then((providers) => {
        if (providers.length > 0)
            return ws.getCrypto(providers[0]);
        else
            throw new Error("Tokens no encontrados");
    });
}

export function listProviders(ws) {
    return ws.info().then((info) => {
        let providers = [];
        for (let i = 0; i < info.providers.length; i++) {
            const provider = info.providers[i];
            if (provider.isHardware)
                providers.push(provider.id);
        }
        return providers;
    });
}

export function listCertificates(provider) {
    let certIDs, keyIDs;
    return Promise.resolve().then(() => {
        if (typeof provider.isLoggedIn == "function") {
            return provider.isLoggedIn()
                .then((ok) => {
                    if (ok)
                        return provider.logout();
                }).then(() => {
                    return provider.login();
                });
        }
    }).then(() => {
        return provider.certStorage.keys()
    }).then((indexes) => {
        certIDs = indexes.filter(function (id) {
            var parts = id.split("-");
            return parts[0] === "x509";
        });
    }).then(() => {
        return provider.keyStorage.keys()
    }).then((indexes) => {
        keyIDs = indexes.filter((id) => {
            var parts = id.split("-");
            return parts[0] === "private";
        });
    }).then(() => {
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

export function createCMSSigned(hash, certSimpl, key, sigtype = 'CADES') {
    let sequence = Promise.resolve();
    let cmsSignedSimpl;
    const eSSCertIDv2 = new ESSCertIDv2();
    const signedAttr = [];

    signedAttr.push(new pkijs.Attribute({
        type: "1.2.840.113549.1.9.3",
        values: [
            new asn1js.ObjectIdentifier({ value: "1.2.840.113549.1.7.1" })
        ]
    })); // contentType

    signedAttr.push(new pkijs.Attribute({
        type: "1.2.840.113549.1.9.4",
        values: [
            new asn1js.OctetString({ valueHex: hash })
        ]
    })); // messageDigest

    if (sigtype === 'CADES')
        sequence = sequence.then(() => {
            return eSSCertIDv2.fillValues({
                hashAlgorithm: "SHA-256",
                certificate: certSimpl
            });
        }).then(() => {
            const signingCertificateV2 = new SigningCertificateV2({certs: [eSSCertIDv2]});

            signedAttr.push(new pkijs.Attribute({
                type: "1.2.840.113549.1.9.16.2.47",
                values: [signingCertificateV2.toSchema()]
            }));
        });

    sequence = sequence.then(() => {
        cmsSignedSimpl = new pkijs.SignedData({
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
        cmsSignedSimpl.signerInfos[0].signedAttrs = new pkijs.SignedAndUnsignedAttributes({
            type: 0,
            attributes: signedAttr
        });
        return cmsSignedSimpl.sign(key, 0, hashAlg);
    });


    return sequence.then(() => {
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

export function pdfHash(pdfRaw, byteRange) {
    var data = pdfsign.removeFromArray(pdfRaw, byteRange[1], byteRange[2]);
    return pkijs.getEngine().subtle.digest(hashAlg, data);
}

export function issuerCertificate() {
    return CA;
}

export function signpdf(pdfRaw, key, certificate, sigtype = 'CADES') {
    return pdfsign.signpdfEmpty(pdfRaw, pkijs.getEngine(), sigtype).then(async ([pdf, byteRange]) => {
        let hash = await pdfHash(pdf, byteRange);
        return createCMSSigned(hash, certificate, key, sigtype).then((signature) => { // hex
            return pdfsign.updateArray(pdf, byteRange[1] + 1, signature);
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
                serialNumber: new asn1js.Integer({ valueHex: serialNumber})
            })
        }));
    });

    ocspReq.tbsRequest.requestList = requestList;
    return ocspReq;
};

function parseOCSP(ocspResBuffer) {
    let result = [];
    const asn1 = asn1js.fromBER(ocspResBuffer);
    const ocspRespSimpl = new pkijs.OCSPResponse({ schema: asn1.result });
    let ocspBasicResp;

    if (ocspRespSimpl.responseStatus.valueBlock.valueDec == 0) { // usar !=
        if("responseBytes" in ocspRespSimpl) {
            const asn1Basic = asn1js.fromBER(ocspRespSimpl.responseBytes.response.
                                             valueBlock.valueHex);
            ocspBasicResp = new pkijs.BasicOCSPResponse({ schema: asn1Basic.result });

            for(let i = 0; i < ocspBasicResp.tbsResponseData.responses.length; i++)
            {
                const typeval = pvutils.bufferToHexCodes(ocspBasicResp.tbsResponseData.responses[i].
                                                         certID.serialNumber.valueBlock.valueHex);
                let subjval = ocspBasicResp.tbsResponseData.responses[i].certStatus.idBlock.tagNumber;

                let data = {serialNumber:typeval,
                            ocsp_status:subjval};

                if (subjval == 1) {
                    data.ocsp_revokedDate = ocspBasicResp.tbsResponseData.
                        responses[i].certStatus.valueBlock.value[0].toDate()
                }
                data.ocsp_update = ocspBasicResp.tbsResponseData.responses[i].thisUpdate;
                result.push(data);
            }

        } else {
            // ERROR
        }
    }

    return result;
}

export async function verifyOCSP(ocspReq, certificates) {
    let serialNumbers = [];
    // TODO: check certificates
    for (let i = 0; i < certificates.length; i++) {
        serialNumbers.push(certificates[i].serialNumber.valueBlock.valueHex);
    }
    let ocspReqBuffer = (await createOCSPReq(serialNumbers)).toSchema(true).toBER(false);

    if (ocspReq != undefined && typeof ocspReq == 'function'){
        try {
            let ocspResult = await ocspReq(ocspReqBuffer);
            let statusCode = ocspResult[0];
            let ocspResBuffer = ocspResult[1];
            return parseOCSP(ocspResBuffer);
        } catch(err) {
            // OCSP no disponible
            console.log("OCSP no disponible:", err);
        }
    }
}

export async function listSignatures(pdf, ocspReq) {
    const result = {data:[]};
    pdf = pdfsign.parsePDF(pdf);

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
        let serialNumber = certificate.serialNumber.valueBlock.valueHex;
        data.serialNumber = pvutils.bufferToHexCodes(serialNumber);
        serialNumbers.push(serialNumber);

        let subFilter = v.get("SubFilter");
        let filter = v.get("Filter");
        data.subFilter = subFilter.name.toUpperCase();

        // Fecha de la firma desde el documento PDF
        // TODO: mejorar
        var date = v.get("M");
        var pattern = /D:(\d{4})(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})-0(\d{1})'00'/;

        if (date != undefined)
            data.signedDate = date.replace(pattern, '$3/$2/$1 $4:$5:$6');

        let signedDataBuffer = pdfsign.removeFromArray(pdf.stream.bytes,
                                                       byteRange[1],
                                                       byteRange[2]);
        signedDataBuffer = pdfsign.removeFromArray(signedDataBuffer,
                                                   byteRange[1]+byteRange[3],
                                                   signedDataBuffer.length);

        data.modified = !(await cmsSignedSimp.verify({signer: 0, data: signedDataBuffer,
                                                      trustedCertificates: trustedCertificates}));

        data.trusted = await certificate.verify(trustedCertificates[0]);
        data.certificate = certificate;
        data.ocsp_status = 2;
        result.data.push(data);
    }

    let ocspReqBuffer = (await createOCSPReq(serialNumbers)).toSchema(true).toBER(false);

    if (ocspReq != undefined && typeof ocspReq == 'function'){
        try {
            let ocspResult = await ocspReq(ocspReqBuffer);
            let statusCode = ocspResult[0];
            let ocspResBuffer = ocspResult[1];
            let ores = parseOCSP(ocspResBuffer);

            for (let i = 0; i < ores.length; i++) {
                let data = result.data[i];
                for (let id in ores[i]) {
                    data[id] = ores[i][id];
                }
            }
        } catch(err) {
            // OCSP no disponible
            console.log("OCSP no disponible:", err);
        }
    }

    return result;
}

export function firstCertificate(provider) {
    let certRaw;
    let certID;

    return listCertificates(provider).then((certificates) => {
        if (certificates.length >0) {
            certID = certificates[0];
            return certificateRaw(provider, certID);
        } else
            throw new Error("No hay certificados.");
    }).then((raw) => {
        certRaw = raw;
        return keyFromCertificateId("private", provider, certID);
    }).then((key) => {
        if (!key)
            throw new Error("Certificado no tiene llave privada.");


        const certSimpl = asn1js.fromBER(certRaw);
        const certificate = new pkijs.Certificate({ schema: certSimpl.result });

        return [key, certificate];
    });
}

export function setEngine(name, provider) {
    pkijs.setEngine(name, provider, new pkijs.CryptoEngine({name: name, crypto: provider, subtle: provider.subtle}));
}
