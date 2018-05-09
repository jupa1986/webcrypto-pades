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
                let certificado = firmas.data[i].certificado;

                let val = certificado.subject.typesAndValues.find((val) => {
                    return val.type == "2.5.4.3";
                });

                if (val) {
                    let subjectName = val.value.valueBlock.value;

                    $("resultado").innerHTML += "<p> <b>Firmado por: </b>" + subjectName + "</p>";

                }
            }
        }).catch((err) => {
            alert(err);
        });
    }

    reader.readAsArrayBuffer(file);
}
