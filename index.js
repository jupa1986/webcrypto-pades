const signutils = require("./signutils");
const PDFSIGN =require("./pdfsign").PDFSIGN;

exports.listarCertificados = signutils.listCertificates;
exports.listarProveedores = signutils.listProviders;
exports.certificadoKey = signutils.keyFromCertificateId;
exports.certificadoRaw = signutils.certificateRaw;
exports.crearCMSFirmado = signutils.createCMSSigned;
exports.firmarPDF = signutils.signpdf;

exports.listarFirmas = signutils.listSignatures;
exports.primerCertificado = signutils.firstCertificate;
exports.primerProveedor = signutils.firstProvider;
exports.espacioFirma = PDFSIGN.signpdfEmpty;
exports.parsePDF = PDFSIGN.parsePDF;
exports.removeFromArray = PDFSIGN._removeFromArray;
exports.updateArray = PDFSIGN._updateArray;
exports.setPDFDocument = PDFSIGN.setPDFDocument;
exports.setEngine = signutils.setEngine;
