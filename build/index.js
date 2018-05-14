"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.primerProveedor = exports.primerCertificado = exports.listarFirmas = exports.issuerCertificate = exports.setEngine = exports.firmarPDF = exports.crearCMSFirmado = exports.certificadoRaw = exports.certificadoKey = exports.listarProveedores = exports.listarCertificados = exports.setPDFDocument = exports.updateArray = exports.removeFromArray = exports.parsePDF = exports.espacioFirma = undefined;

var _pdfsign = require("./pdfsign.js");

var _signutils = require("./signutils.js");

exports.espacioFirma = _pdfsign.signpdfEmpty;
exports.parsePDF = _pdfsign.parsePDF;
exports.removeFromArray = _pdfsign.removeFromArray;
exports.updateArray = _pdfsign.updateArray;
exports.setPDFDocument = _pdfsign.setPDFDocument;
exports.listarCertificados = _signutils.listCertificates;
exports.listarProveedores = _signutils.listProviders;
exports.certificadoKey = _signutils.keyFromCertificateId;
exports.certificadoRaw = _signutils.certificateRaw;
exports.crearCMSFirmado = _signutils.createCMSSigned;
exports.firmarPDF = _signutils.signpdf;
exports.setEngine = _signutils.setEngine;
exports.issuerCertificate = _signutils.issuerCertificate;
exports.listarFirmas = _signutils.listSignatures;
exports.primerCertificado = _signutils.firstCertificate;
exports.primerProveedor = _signutils.firstProvider;
//# sourceMappingURL=index.js.map