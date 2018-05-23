function $(id) {
    const result = document.getElementById(id);
    if (!result) {
        throw new Error("Cannot get element by id '" + id + "'");
    }
    return result;
}

// No 'Access-Control-Allow-Origin' header is present on the requested resource.
function HTTPOCSPRequest(ocspReqBuffer) {
    return new Promise(function (resolve, reject) {
        let url = "http://firmadigital.bo/ocsp/";

        var xhr = new XMLHttpRequest();
        xhr.open("POST", url, true);
        // xhr.setRequestHeader("Content-type", "application/ocsp-request");
        xhr.responseType='arraybuffer';
        xhr.onload = function(e) {
            resolve([200, e.target.response]);
        }
        xhr.onerror = reject;
        xhr.send(ocspReqBuffer);
    });
}

var $file = $("pdfFile");

$file.onchange = function (ev) {
    var file = ev.currentTarget.files[0];
    var reader = new FileReader();

    pdfsign.setPDFDocument(pdfjsWorker.PDFDocument);
    $("resultado").innerHTML = "";
    reader.onload = (data) => {
        let pdfBuffer = data.target.result;
        let sequence = pdfsign.listSignatures(pdfBuffer, HTTPOCSPRequest).then((signatures) => {
            // listar todas las firmas
            for (let i in signatures.data) {
                let data = signatures.data[i];

                // Issuer
                for ( let i in data.certificate.issuer.typesAndValues) {
                    var tav = data.certificate.issuer.typesAndValues[i];
                    $("resultado").innerHTML += "<p> <b> "+ tav.type +" </b>" +
                        tav.value.valueBlock.value + "</p>";
                }
                // Subject
                for ( let i in data.certificate.subject.typesAndValues) {
                    var tav = data.certificate.subject.typesAndValues[i];

                    $("resultado").innerHTML += "<p> <b> "+ tav.type +" </b>" +
                        tav.value.valueBlock.value + "</p>";
                }
                delete data.certificate;
                for (let i in data) {
                    $("resultado").innerHTML += "<p> <b> "+ i +" </b>" +
                        data[i] + "</p>";
                }
            }

        }).catch((err) => {
            alert(err);
        });
    }

    reader.readAsArrayBuffer(file);
}
