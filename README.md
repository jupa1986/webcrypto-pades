# PDFJS-FIRMA

Es una biblioteca que firmar y lista firmas de PDF en el navegador y en nodejs.

```javascript
let pdf = await pdfsign.firmarPDF(pdfBuffer, key, certificate);
```

```javascript
let firmas = await pdfsign.listarFirmas(pdfBuffer, HTTPOCSPRequest);
```

Los ejemplos de firma con nodejs en `ejemplos/` y los ejemplos de firma en el navegador `ejemplos/simple`.
En el navegador require de [fortify](https://tools.fortifyapp.com/), para nodejs [node-webcrypto-p11](https://github.com/PeculiarVentures/node-webcrypto-p11) y [node-webcrypto-ossl](https://github.com/PeculiarVentures/node-webcrypto-ossl).

Basado en el proyecto [pdfsign.js](https://github.com/Communication-Systems-Group/pdfsign.js)
