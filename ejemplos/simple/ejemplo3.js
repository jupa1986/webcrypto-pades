function $(id) {
    const result = document.getElementById(id);
    if (!result) {
        throw new Error("Cannot get element by id '" + id + "'");
    }
    return result;
}

var $file = $("pdfFile");

$file.onchange = function (ev) {
    var file = ev.currentTarget.files[0];
    var reader = new FileReader();

    pdffirma.setPDFDocument(pdfjsWorker.PDFDocument);
    $("resultado").innerHTML = "";
    reader.onload = (data) => {
        let pdfBuffer = data.target.result;
        let sequence = pdffirma.listarFirmas(pdfBuffer).then((firmas) => {
            // listar todas las firmas
            for (let i in firmas.data) {
                let data = firmas.data[i];

                // Issuer
                for ( let i in data.certificado.issuer.typesAndValues) {
                    var tav = data.certificado.issuer.typesAndValues[i];
                    $("resultado").innerHTML += "<p> <b> "+ tav.type +" </b>" +
                        tav.value.valueBlock.value + "</p>";
                }
                // Subject
                for ( let i in data.certificado.subject.typesAndValues) {
                    var tav = data.certificado.subject.typesAndValues[i];

                    $("resultado").innerHTML += "<p> <b> "+ tav.type +" </b>" +
                        tav.value.valueBlock.value + "</p>";
                }

            }
        }).catch((err) => {
            alert(err);
        });
    }

    reader.readAsArrayBuffer(file);
}
