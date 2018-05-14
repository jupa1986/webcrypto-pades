"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.listSignatures = undefined;

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var createOCSPReq = function () {
    var _ref3 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(serialNumbers) {
        var extension, issuerKeyHash, issuerNameHash, ocspReq, requestList;
        return regeneratorRuntime.wrap(function _callee$(_context) {
            while (1) {
                switch (_context.prev = _context.next) {
                    case 0:

                        if (!(serialNumbers instanceof Array)) serialNumbers = [serialNumbers];

                        extension = CA.extensions.find(function (extension) {
                            return extension.extnID == "2.5.29.14";
                        });
                        issuerKeyHash = extension.parsedValue.valueBlock.valueHex;
                        _context.next = 5;
                        return pkijs.getCrypto().subtle.digest('SHA-1', CA.subject.valueBeforeDecode);

                    case 5:
                        issuerNameHash = _context.sent;
                        ocspReq = new pkijs.OCSPRequest();
                        requestList = [];


                        serialNumbers.forEach(function (serialNumber) {
                            requestList.push(new pkijs.Request({
                                reqCert: new pkijs.CertID({
                                    hashAlgorithm: new pkijs.AlgorithmIdentifier({
                                        algorithmId: "1.3.14.3.2.26"
                                    }),
                                    issuerNameHash: new asn1js.OctetString({ valueHex: issuerNameHash }),
                                    issuerKeyHash: new asn1js.OctetString({ valueHex: issuerKeyHash }),
                                    serialNumber: new asn1js.Integer({ valueHex: serialNumber }) // cert.serialNumber.valueBlock.valueHex
                                })
                            }));
                        });

                        ocspReq.tbsRequest.requestList = requestList;
                        return _context.abrupt("return", ocspReq);

                    case 11:
                    case "end":
                        return _context.stop();
                }
            }
        }, _callee, this);
    }));

    return function createOCSPReq(_x) {
        return _ref3.apply(this, arguments);
    };
}();

var listSignatures = exports.listSignatures = function () {
    var _ref4 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee2(pdf, ocspReq) {
        var result, sigFields, serialNumbers, i, data, sigField, v, byteRange, contents, contentBuffer, asn1, cmsContentSimp, cmsSignedSimp, certificate, subFilter, filter, date, pattern, signedDataBuffer, ocspReqBuffer, _ref5, _ref6, _asn, ocspRespSimpl, ocspBasicResp, asn1Basic, _loop, _i;

        return regeneratorRuntime.wrap(function _callee2$(_context2) {
            while (1) {
                switch (_context2.prev = _context2.next) {
                    case 0:
                        result = { data: [] };

                        pdf = pdfsign.parsePDF(pdf);

                        sigFields = listSigFields(pdf);
                        serialNumbers = [];
                        _context2.t0 = regeneratorRuntime.keys(sigFields);

                    case 5:
                        if ((_context2.t1 = _context2.t0()).done) {
                            _context2.next = 38;
                            break;
                        }

                        i = _context2.t1.value;
                        data = {};
                        sigField = sigFields[i];
                        v = sigField.get("V");
                        byteRange = v.get("ByteRange");
                        contents = v.get("Contents");
                        contentBuffer = pvutils.stringToArrayBuffer(contents);
                        asn1 = asn1js.fromBER(contentBuffer);
                        cmsContentSimp = new pkijs.ContentInfo({ schema: asn1.result });
                        cmsSignedSimp = new pkijs.SignedData({ schema: cmsContentSimp.content });
                        certificate = cmsSignedSimp.certificates[0];


                        data.numeroSerie = pvutils.bufferToHexCodes(certificate.serialNumber.valueBlock.valueHex);
                        serialNumbers.push(certificate.serialNumber.valueBlock.valueHex);

                        subFilter = v.get("SubFilter");
                        filter = v.get("Filter");

                        data.subFilter = subFilter.name.toUpperCase();

                        // Fecha de la firma desde el documento PDF
                        // TODO: mejorar
                        date = v.get("M");
                        pattern = /D:(\d{4})(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})-0(\d{1})'00'/;


                        if (date != undefined) data.fechaFirma = date.replace(pattern, '$3/$2/$1 $4:$5:$6');

                        // Limpiar Campo de la firma
                        signedDataBuffer = pdfsign.removeFromArray(pdf.stream.bytes, byteRange[1], byteRange[2]);
                        // Limpiar datos

                        signedDataBuffer = pdfsign.removeFromArray(signedDataBuffer, byteRange[1] + byteRange[3], signedDataBuffer.length);

                        _context2.next = 29;
                        return cmsSignedSimp.verify({ signer: 0, data: signedDataBuffer,
                            trustedCertificates: trustedCertificates });

                    case 29:
                        data.autenticidad = _context2.sent;
                        _context2.next = 32;
                        return certificate.verify(trustedCertificates[0]);

                    case 32:
                        data.cadenaConfianza = _context2.sent;

                        // data.certificado = pvutils.toBase64(pvutils.arrayBufferToString(certificate.tbs));
                        data.certificado = certificate;
                        data.ocsp_estado = 2; // Desconocido por defecto.
                        result.data.push(data);
                        _context2.next = 5;
                        break;

                    case 38:
                        _context2.next = 40;
                        return createOCSPReq(serialNumbers);

                    case 40:
                        ocspReqBuffer = _context2.sent.toSchema(true).toBER(false);

                        if (!(ocspReq != undefined && typeof ocspReq == 'function')) {
                            _context2.next = 58;
                            break;
                        }

                        _context2.prev = 42;
                        _context2.next = 45;
                        return ocspReq(ocspReqBuffer);

                    case 45:
                        _ref5 = _context2.sent;
                        _ref6 = _slicedToArray(_ref5, 2);
                        statusCode = _ref6[0];
                        ocspResBuffer = _ref6[1];
                        _asn = asn1js.fromBER(ocspResBuffer);
                        ocspRespSimpl = new pkijs.OCSPResponse({ schema: _asn.result });
                        ocspBasicResp = void 0;


                        if (ocspRespSimpl.responseStatus.valueBlock.valueDec == 0) {
                            // usar !=
                            if ("responseBytes" in ocspRespSimpl) {
                                asn1Basic = asn1js.fromBER(ocspRespSimpl.responseBytes.response.valueBlock.valueHex);

                                ocspBasicResp = new pkijs.BasicOCSPResponse({ schema: asn1Basic.result });
                                if (serialNumbers.length != ocspBasicResp.tbsResponseData.responses.length) {
                                    // ERROR
                                }

                                _loop = function _loop(_i) {
                                    var typeval = pvutils.bufferToHexCodes(ocspBasicResp.tbsResponseData.responses[_i].certID.serialNumber.valueBlock.valueHex);
                                    var subjval = ocspBasicResp.tbsResponseData.responses[_i].certStatus.idBlock.tagNumber;

                                    var data = result.data.find(function (data) {
                                        return data.numeroSerie == typeval;
                                    });
                                    if (data) data.ocsp_estado = subjval;

                                    if (subjval == 1) {
                                        data.ocsp_fechaRevocacion = ocspBasicResp.tbsResponseData.responses[_i].certStatus.valueBlock.value[0].toDate();
                                    }
                                    data.ocsp_fechaActualizacion = ocspBasicResp.tbsResponseData.responses[_i].thisUpdate;
                                };

                                for (_i = 0; _i < ocspBasicResp.tbsResponseData.responses.length; _i++) {
                                    _loop(_i);
                                }
                            } else {
                                // ERROR
                            }
                        }
                        _context2.next = 58;
                        break;

                    case 55:
                        _context2.prev = 55;
                        _context2.t2 = _context2["catch"](42);

                        // OCSP no disponible
                        console.log("OCSP no disponible:", _context2.t2);

                    case 58:
                        return _context2.abrupt("return", result);

                    case 59:
                    case "end":
                        return _context2.stop();
                }
            }
        }, _callee2, this, [[42, 55]]);
    }));

    return function listSignatures(_x2, _x3) {
        return _ref4.apply(this, arguments);
    };
}();

exports.certificateRaw = certificateRaw;
exports.keyFromCertificateId = keyFromCertificateId;
exports.firstProvider = firstProvider;
exports.listProviders = listProviders;
exports.listCertificates = listCertificates;
exports.createCMSSigned = createCMSSigned;
exports.issuerCertificate = issuerCertificate;
exports.signpdf = signpdf;
exports.firstCertificate = firstCertificate;
exports.setEngine = setEngine;

var _pkijs = require("pkijs");

var pkijs = _interopRequireWildcard(_pkijs);

var _asn1js = require("asn1js");

var asn1js = _interopRequireWildcard(_asn1js);

var _pvutils = require("pvutils");

var pvutils = _interopRequireWildcard(_pvutils);

var _pdfsign = require("./pdfsign.js");

var pdfsign = _interopRequireWildcard(_pdfsign);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

var trustedCertificates = []; // Array of Certificates

var CA64 = "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";

var asn2 = asn1js.fromBER(pvutils.stringToArrayBuffer(pvutils.fromBase64(CA64)));
var CA = new pkijs.Certificate({ schema: asn2.result });
trustedCertificates.push(CA);

function certificateRaw(provider, certID) {
    return Promise.resolve().then(function () {
        return provider.certStorage.getItem(certID).then(function (cert) {
            return provider.certStorage.exportCert('raw', cert).then(function (raw) {
                return raw;
            });
        });
    });
}

function keyFromCertificateId(type, provider, certID) {
    return Promise.resolve().then(function () {
        return provider.keyStorage.keys();
    }).then(function (keyIDs) {
        for (var i = 0; i < keyIDs.length; i++) {
            var keyID = keyIDs[i];
            var parts = keyID.split("-");

            if (parts[0] === type && parts[2] === certID.split("-")[2]) {
                return provider.keyStorage.getItem(keyID);
            }
        }
        return null;
    }).then(function (key) {
        if (key || type !== "public") {
            return key;
        }

        return provider.certStorage.getItem(certID).then(function (cert) {
            return cert.publicKey;
        });
    });
}

function firstProvider(ws) {
    return listProviders(ws).then(function (providers) {
        if (providers.length > 0) return ws.getCrypto(providers[0]);else throw new Error("Tokens no encontrados");
    });
}

function listProviders(ws) {
    return ws.info().then(function (info) {
        var providers = [];
        for (var i = 0; i < info.providers.length; i++) {
            var provider = info.providers[i];
            if (provider.isHardware) providers.push(provider.id);
        }
        return providers;
    });
}

function listCertificates(provider) {
    var certIDs = void 0,
        keyIDs = void 0;
    return Promise.resolve() // Habilitar en el navegador
    .then(function () {
        if (typeof provider.isLoggedIn == "function") {
            return provider.isLoggedIn().then(function (ok) {
                if (ok) return provider.logout();
            }).then(function () {
                return provider.login();
            });
        }
    }).then(function () {
        return provider.certStorage.keys();
    }).then(function (indexes) {
        certIDs = indexes.filter(function (id) {
            var parts = id.split("-");
            return parts[0] === "x509";
        });
    }).then(function () {
        return provider.keyStorage.keys();
    }).then(function (indexes) {
        keyIDs = indexes.filter(function (id) {
            var parts = id.split("-");
            return parts[0] === "private";
        });
    }).then(function () {
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

    var cmsSignedSimpl = new pkijs.SignedData({
        version: 1,
        encapContentInfo: new pkijs.EncapsulatedContentInfo({
            eContentType: "1.2.840.113549.1.7.1" // "data" content type
        }),
        digestAlgorithms: [],
        signerInfos: [new pkijs.SignerInfo({
            version: 1,
            sid: new pkijs.IssuerAndSerialNumber({
                issuer: certSimpl.issuer,
                serialNumber: certSimpl.serialNumber
            })
        })],
        certificates: [certSimpl]
    });

    //TODO: añadir extensiones
    return cmsSignedSimpl.sign(key, 0, "sha-256", data).then(function () {
        // SHA-256 por defecto
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

function issuerCertificate() {
    return CA;
}

function signpdf(pdfRaw, key, certificate) {
    return pdfsign.signpdfEmpty(pdfRaw, pkijs.getEngine()).then(function (_ref) {
        var _ref2 = _slicedToArray(_ref, 2),
            pdf = _ref2[0],
            byteRange = _ref2[1];

        var data = pdfsign.removeFromArray(pdf, byteRange[1], byteRange[2]);
        return createCMSSigned(data, certificate, key).then(function (signature) {
            // hex
            return pdfsign.updateArray(pdf, byteRange[1] + 1, signature);
        });
    });
}

function listSigFields(pdf) {
    var sigFields = [];

    var acroForm = pdf.xref.root.get("AcroForm");
    if (typeof acroForm === "undefined") throw new Error("El PDF no tiene firmas!");

    var fields = acroForm.get("Fields");
    // TODO
    // if(window.isRef(fields[0]) === false)
    //      throw new Error("Wrong structure of PDF!");
    for (var i = 0; i < fields.length; i++) {
        var sigField = pdf.xref.fetch(fields[i]);
        var sigFieldType = sigField.get("FT");
        if (typeof sigFieldType === "undefined" || sigFieldType.name !== "Sig")
            // throw new Error("Wrong structure of PDF!");
            continue; //Ignorar Tx o Btn
        sigFields.push(sigField);
    }

    if (sigFields.length == 0) throw new Error("El PDF no tiene firmas!");

    return sigFields;
}

;

function firstCertificate(provider) {
    var certRaw = void 0;
    var certID = void 0;

    var sequence = listCertificates(provider).then(function (certificados) {
        if (certificados.length > 0) {
            // Seleccionar el primer certificado
            certID = certificados[0];
            return certificateRaw(provider, certID);
        } else throw new Error("No hay certificados.");
    });

    sequence = sequence.then(function (raw) {
        certRaw = raw;
        return keyFromCertificateId("private", provider, certID);
    });

    sequence = sequence.then(function (key) {
        if (!key) throw new Error("Certificado no tiene llave privada.");

        var certSimpl = asn1js.fromBER(certRaw);
        var certificate = new pkijs.Certificate({ schema: certSimpl.result });

        return [key, certificate];
    });
    return sequence;
}

function setEngine(nombre, provider) {
    pkijs.setEngine(nombre, provider, new pkijs.CryptoEngine({ name: 'local', crypto: provider, subtle: provider.subtle }));
}
//# sourceMappingURL=signutils.js.map