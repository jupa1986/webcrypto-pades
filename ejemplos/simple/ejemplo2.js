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


$("firmar").onclick = (ev) => {

    var table = $("documentos");
    for (let i = 1; i < table.rows.length; i++) {
        var id = table.rows[i].dataset.id;
        console.log(id);
        //Actualizar estado
        table.rows[i].cells[2].innerHTML = "sin firmar";
    }

    // Codigo para firmar digital de un documento PDF.
    let sequence = pdffirma.primerProveedor(ws).then((provider) => {

        // Configuracion
        pdffirma.setPDFDocument(pdfjsWorker.PDFDocument);
        pdffirma.setEngine('local', provider);

        // Buscar token, leer par de claves y firmar el documento PDF
        return pdffirma.primerCertificado(provider).then(async ([key, certificate]) => {
            // Firmar uno o varios PDFs
            var table = $("documentos");
            for (let i = 1; i < table.rows.length; i++) {
                var id = table.rows[i].dataset.id;
                try {
                    console.log(id);
                    let pdfRaw = (await leerPDF(id)).target.response;
                    console.log(pdfRaw);
                    let dataSigned = await pdffirma.firmarPDF(pdfRaw, key, certificate);
                    await guardarPDF(dataSigned);
                    //Actualizar estado
                    table.rows[i].cells[2].innerHTML = "firmado";
                } catch (err) {
                    console.error(err);
                }
            }

        });

    }).catch((err) => {
        console.error(err);
        alert("Error: Ver logs!");
    });
};

////////////////////////////////////////////////////////////////////////////////////////////////

function request(url) {
    return new Promise(function (resolve, reject) {
        var xhr = new XMLHttpRequest();
        xhr.responseType='arraybuffer';
        xhr.open("GET", url, true);
        xhr.onload = resolve;
        xhr.onerror = reject;
        xhr.send();
    });
}

function leerPDF(url) {
    return request(url);
}

async function guardarPDF(dataSigned) {
    // Implementar
    const a = window.document.createElement('a');
    a.href = window.URL.createObjectURL(new Blob([dataSigned], { type: 'application/pdf' }));
    a.download = 'miPDFFirmado.pdf';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
}
