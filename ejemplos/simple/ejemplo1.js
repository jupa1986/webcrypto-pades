function $(id) {
    const result = document.getElementById(id);
    if (!result) {
        throw new Error("Cannot get element by id '" + id + "'");
    }
    return result;
}

// Conectarse con fortify
var ws = new WebcryptoSocket.SocketProvider();
var isOpen = false;
ws.connect("127.0.0.1:31337")
    .on("error", function (e) {
        console.error(e);
    })
    .on("listening", function (e) {
        // Check if end-to-end session is approved
        ws.isLoggedIn()
            .then(function (ok) {
                console.log("Session approved:", ok);
                if (!ok) {
                    return ws.challenge()
                        .then(function (pin) {
                            // show PIN
                            setTimeout(function () {
                                alert("2key session PIN:" + pin);
                            }, 100)
                            // ask to approve session
                            return ws.login();
                        });
                }
            })
            .then(function () {
                isOpen = true;
            }, function () {
                alert("PIN is not approved");
            })
    })
    .on("token", function () {
        console.log("TOKEN");
        // update provider list

    })
    .on("close", function () {
        isOpen = false;
    });

var $file = $("pdfFile");

$file.onchange = function (ev) {
    var file = ev.currentTarget.files[0];
    var reader = new FileReader();

    reader.onload = (data) => {

        // Codigo para firmar digital de un documento PDF.
        let sequence = pdfutils.primerProveedor(ws).then((provider) => {

            // Configuracion
            pdfutils.setPDFDocument(pdfjsWorker.PDFDocument);
            pkijs.setEngine('local', provider, provider.subtle);

            // Buscar token, leer par de claves y firmar el documento PDF
            return pdfutils.primerCertificado(provider).then(async ([key, certificate]) => {
                // Firmar uno o varios PDFs
                let pdfRaw = data.target.result;
                let dataSigned = await pdfutils.firmarPDF(pdfRaw, key, certificate);
                await guardarPDF(dataSigned);
            });

        }).catch((err) => {
            console.error(err);
            alert("Error: Ver logs!");
        });

    };

    reader.readAsArrayBuffer(file);
}

async function guardarPDF(dataSigned) {
    const a = window.document.createElement('a');
    a.href = window.URL.createObjectURL(new Blob([dataSigned], { type: 'application/pdf' }));
    a.download = 'miPDFFirmado.pdf';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
}
