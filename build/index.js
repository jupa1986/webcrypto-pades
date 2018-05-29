"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.verifyOCSP = exports.pdfHash = exports.firstProvider = exports.firstCertificate = exports.listSignatures = exports.issuerCertificate = exports.setEngine = exports.signpdf = exports.createCMSSigned = exports.certificateRaw = exports.keyFromCertificateId = exports.listProviders = exports.listCertificates = exports.setPDFDocument = exports.updateArray = exports.removeFromArray = exports.parsePDF = exports.signpdfEmpty = undefined;

var _pdfsign = require("./pdfsign.js");

var _signutils = require("./signutils.js");

exports.signpdfEmpty = _pdfsign.signpdfEmpty;
exports.parsePDF = _pdfsign.parsePDF;
exports.removeFromArray = _pdfsign.removeFromArray;
exports.updateArray = _pdfsign.updateArray;
exports.setPDFDocument = _pdfsign.setPDFDocument;
exports.listCertificates = _signutils.listCertificates;
exports.listProviders = _signutils.listProviders;
exports.keyFromCertificateId = _signutils.keyFromCertificateId;
exports.certificateRaw = _signutils.certificateRaw;
exports.createCMSSigned = _signutils.createCMSSigned;
exports.signpdf = _signutils.signpdf;
exports.setEngine = _signutils.setEngine;
exports.issuerCertificate = _signutils.issuerCertificate;
exports.listSignatures = _signutils.listSignatures;
exports.firstCertificate = _signutils.firstCertificate;
exports.firstProvider = _signutils.firstProvider;
exports.pdfHash = _signutils.pdfHash;
exports.verifyOCSP = _signutils.verifyOCSP;