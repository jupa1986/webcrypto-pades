const signutils = require("./signutils");
const pdfsign =require("./pdfsign");

exports.listarCertificados = signutils.listCertificates;
exports.listarProveedores = signutils.listProviders;
exports.certificadoKey = signutils.keyFromCertificateId;
exports.certificadoRaw = signutils.certificateRaw;
exports.crearCMSFirmado = signutils.createCMSSigned;
exports.firmarPDF = signutils.signpdf;

exports.listarFirmas = signutils.listSignatures;
exports.primerCertificado = signutils.firstCertificate;
exports.primerProveedor = signutils.firstProvider;
exports.espacioFirma = pdfsign.signpdfEmpty;
exports.parsePDF = pdfsign.parsePDF;
exports.removeFromArray = pdfsign.removeFromArray;
exports.updateArray = pdfsign.updateArray;
exports.setPDFDocument = pdfsign.setPDFDocument;
exports.setEngine = signutils.setEngine;
exports.issuerCertificate = signutils.issuerCertificate;
