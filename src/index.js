import {signpdfEmpty, parsePDF, removeFromArray, updateArray, setPDFDocument} from "./pdfsign.js";
export {signpdfEmpty as espacioFirma, parsePDF, removeFromArray, updateArray, setPDFDocument};

import {listCertificates, listProviders, keyFromCertificateId, certificateRaw, createCMSSigned, signpdf, setEngine, issuerCertificate, listSignatures, firstCertificate, firstProvider} from "./signutils.js";
export {listCertificates as listarCertificados};
export {listProviders as listarProveedores};
export {keyFromCertificateId as certificadoKey};
export {certificateRaw as certificadoRaw};
export {createCMSSigned as crearCMSFirmado};
export {signpdf as firmarPDF};
export {setEngine as setEngine};
export {issuerCertificate as issuerCertificate};
export {listSignatures as listarFirmas};
export {firstCertificate as primerCertificado};
export {firstProvider as primerProveedor};
