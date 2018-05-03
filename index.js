const signutils = require("./signutils");
const PDFSIGN =require("./pdfsign").PDFSIGN;

exports.listarCertificados = signutils.listarCertificados;
exports.listarProveedores = signutils.listarProveedores;
exports.certificadoKey = signutils.certificadoKey;
exports.certificadoRaw = signutils.certificadoRaw;
exports.finalizarFirmarPDF = signutils.makeSignature;
exports.firmarPDF = signutils.signpdf;

exports.listarFirmas = signutils.listarFirmas;
exports.primerCertificado = signutils.primerCertificado;
exports.primerProveedor = signutils.primerProveedor;
exports.espacioFirma = PDFSIGN.makeSignatureSpace;
exports.parsePDF = PDFSIGN.parsePDF;
exports.removeFromArray = PDFSIGN._removeFromArray;
exports.updateArray = PDFSIGN._updateArray;
exports.setPDFDocument = PDFSIGN.setPDFDocument;
