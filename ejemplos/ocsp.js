const pkijs = require("pkijs");
const asn1js = require("asn1js");
const pvutils = require("pvutils");
const fs = require("fs");
var WebCrypto = require("node-webcrypto-ossl");

webcrypto = new WebCrypto();


const issuerNameHash = [0x0D,0xD9,0xE9,0xD7,0x5B,0x98,0x5F,0xA8,0x7B,
                        0x71,0xEE,0x26,0xDD,0xDE,0x63,0x8F,0xCD,0xE1,
                        0x4D,0xCF];
const issuerKeyHash  = [0xD2,0x99,0xDD,0xC1,0x6F,0x25,0x2E,0x27,0xA8,
                        0x0B,0xEB,0xDC,0xD9,0xD6,0x92,0x5B,0x62,0x55,
                        0xA0,0xC2];

let serialNumber     = [0x14,0x33,0xAE,0x7A,0xEF,0xC4,0x96,0xE7];

let ocspReqBuffer = new ArrayBuffer(0);
const ocspReq = new pkijs.OCSPRequest();

ocspReq.tbsRequest.requestList = [new pkijs.Request({
	reqCert: new pkijs.CertID({
		hashAlgorithm: new pkijs.AlgorithmIdentifier({
			algorithmId: "1.3.14.3.2.26"
		}),
		issuerNameHash: new asn1js.OctetString({ valueHex: new Uint8Array(issuerNameHash).buffer }),
		issuerKeyHash: new asn1js.OctetString({ valueHex: new Uint8Array(issuerKeyHash).buffer }),
		serialNumber: new asn1js.Integer({ valueHex: new Uint8Array(serialNumber).buffer })
	})
}),new pkijs.Request({
	reqCert: new pkijs.CertID({
		hashAlgorithm: new pkijs.AlgorithmIdentifier({
			algorithmId: "1.3.14.3.2.26"
		}),
		issuerNameHash: new asn1js.OctetString({ valueHex: new Uint8Array(issuerNameHash).buffer }),
		issuerKeyHash: new asn1js.OctetString({ valueHex: new Uint8Array(issuerKeyHash).buffer }),
		serialNumber: new asn1js.Integer({ valueHex: new Uint8Array(serialNumber).buffer })
	})
})];

ocspReqBuffer = ocspReq.toSchema(true).toBER(false);

const request = require("request");
const streams = require('memory-streams');

function ocspRequest(ocspReqBuffer, writeStream){
    options = {
        url: "http://firmadigital.bo/ocsp/",
        method: 'POST',
        contentType: 'application/ocsp-request',
        body: Buffer.from(ocspReqBuffer)
    };

    let sequence = new Promise((resolve, reject) => {
        request(options, (err, res) => {
            if(!err) {
                resolve(res);
            } else {
                reject(err);
            }
        }).pipe(writeStream);
    });

    return sequence;
}

let writeStream = new streams.WritableStream();

let sequence = ocspRequest(ocspReqBuffer, writeStream).then((res) => {
    // console.log('done');
    // console.log(res.statusCode);
}).catch((e) => {
    console.log(e.message);
});

sequence.then(() => {
    console.log("OCSP Response Data:");
    // ocspResponseBuffer
    const asn1 = asn1js.fromBER(new Uint8Array(writeStream.toBuffer()).buffer);
	const ocspRespSimpl = new pkijs.OCSPResponse({ schema: asn1.result });

    let ocspBasicResp;

    let status = "";
	switch(ocspRespSimpl.responseStatus.valueBlock.valueDec)
	{
		case 0:
		status = "successful";
		break;
		case 1:
		status = "malformedRequest";
		break;
		case 2:
		status = "internalError";
		break;
		case 3:
		status = "tryLater";
		break;
		case 4:
		status = "<not used>";
		break;
		case 5:
		status = "sigRequired";
		break;
		case 6:
		status = "unauthorized";
		break;
		default:
		alert("Wrong OCSP response status");
		return;
	}
    console.log("\tOCSP Response Status:", status);

    if("responseBytes" in ocspRespSimpl) {
        const asn1Basic = asn1js.fromBER(ocspRespSimpl.responseBytes.response.valueBlock.valueHex);
		ocspBasicResp = new pkijs.BasicOCSPResponse({ schema: asn1Basic.result });
    } else
		return;

    const algomap = {
		"1.2.840.113549.2.1": "MD2",
		"1.2.840.113549.1.1.2": "MD2 with RSA",
		"1.2.840.113549.2.5": "MD5",
		"1.2.840.113549.1.1.4": "MD5 with RSA",
		"1.3.14.3.2.26": "SHA1",
		"1.2.840.10040.4.3": "SHA1 with DSA",
		"1.2.840.10045.4.1": "SHA1 with ECDSA",
		"1.2.840.113549.1.1.5": "SHA1 with RSA",
		"2.16.840.1.101.3.4.2.4": "SHA224",
		"1.2.840.113549.1.1.14": "SHA224 with RSA",
		"2.16.840.1.101.3.4.2.1": "SHA256",
		"1.2.840.113549.1.1.11": "SHA256 with RSA",
		"2.16.840.1.101.3.4.2.2": "SHA384",
		"1.2.840.113549.1.1.12": "SHA384 with RSA",
		"2.16.840.1.101.3.4.2.3": "SHA512",
		"1.2.840.113549.1.1.13": "SHA512 with RSA"
	};

    let signatureAlgorithm = algomap[ocspBasicResp.signatureAlgorithm.algorithmId];
	if(typeof signatureAlgorithm === "undefined")
		signatureAlgorithm = ocspBasicResp.signatureAlgorithm.algorithmId;
	else
		signatureAlgorithm = `${signatureAlgorithm} (${ocspBasicResp.signatureAlgorithm.algorithmId})`;
    // console.log("Algorithm:", signatureAlgorithm);


    for(let i = 0; i < ocspBasicResp.tbsResponseData.responses.length; i++)
	{
        const typeval = pvutils.bufferToHexCodes(ocspBasicResp.tbsResponseData.responses[i].certID.serialNumber.valueBlock.valueHex);
		let subjval = "";
		switch(ocspBasicResp.tbsResponseData.responses[i].certStatus.idBlock.tagNumber)
		{
			case 0:
			subjval = "good";
			break;
			case 1:
			subjval = "revoked";
			break;
			case 2:
			default:
			subjval = "unknown";
		}

        console.log("\tCertificate ID:");
        console.log("\t\tHash Algorithm:", algomap[ocspBasicResp.tbsResponseData.responses[i].certID.hashAlgorithm.algorithmId]);
        console.log("\t\tIssuer Name Hash:", pvutils.bufferToHexCodes(ocspBasicResp.tbsResponseData.responses[i].certID.issuerNameHash.valueBlock.valueHex));
        console.log("\t\tIssuer Key Hash:", pvutils.bufferToHexCodes(ocspBasicResp.tbsResponseData.responses[i].certID.issuerKeyHash.valueBlock.valueHex));
        console.log("\t\tSerial Number:", typeval);
        console.log("\tCert Status:", subjval);
        console.log("\tRevocation Time:", ocspBasicResp.tbsResponseData.responses[i].certStatus.valueBlock.value[0].toDate());
        console.log("\tRevocation Reason:","?");
        console.log("\tThis Update:", ocspBasicResp.tbsResponseData.responses[i].thisUpdate);
        console.log("");
    }

});

// openssl ocsp -respin out.orq -text
