/*
 * PDFSign v1.0.0
 * https://github.com/Communication-Systems-Group/pdfsign.js
 *
 * Copyright 2015, Thomas Bocek, University of Zurich
 *
 * Licensed under the MIT license:
 * http://www.opensource.org/licenses/MIT
 */

//using the object if available or creating a new instance if not present

var pvutils = require('pvutils');

var PDFDocument;

var PDFSIGN = (function () {
    function createXrefTable(xrefEntries) {
        xrefEntries = sortOnKeys(xrefEntries);
        var retVal ='xref\n';
        var last = -2;
        for(var i in xrefEntries) {
            i = parseInt(i);
            if(typeof xrefEntries[i].offset === 'undefined') { continue; }
            retVal += calcFlow(i, last, xrefEntries);
            var offset = xrefEntries[i].offset;
            retVal += pad10(offset)+' '+pad5(xrefEntries[i].gen)+' '+(xrefEntries[i].free?'f':'n')+' \n';
            last = i;
        }
        return retVal;
    }

    function calcFlow(i, last, xrefEntries) {
        if(last + 1 === i) {return '';}
        var count = 1;
        while(typeof xrefEntries[(i+count)] !== 'undefined'
              && typeof xrefEntries[(i+count)].offset !== 'undefined') {count ++;}
        return i + ' '+count+'\n';
    }

    function createTrailer(topDict, startxref, sha256Hex, size, prev) {
        var retVal ='trailer <<\n';
        retVal +='  /Size '+(size)+'\n';
        var refRoot = topDict.getRaw('Root');
        if(typeof refRoot !== 'undefined') {
            retVal +='  /Root '+refRoot.num+' '+refRoot.gen+' R\n';
        }
        var refInfo = topDict.getRaw('Info');
        if(typeof refInfo !== 'undefined') {
            retVal +='  /Info '+refInfo.num+' '+refInfo.gen+' R\n';
        }
        retVal +='  /ID [<'+sha256Hex.substring(0,32)+'><'+sha256Hex.substring(32,64)+'>]\n';
        if(typeof prev !== 'undefined' ) {
            retVal +='  /Prev '+prev+'\n';
        }
        retVal +='>>\n';
        retVal +='startxref\n';
        retVal +=startxref + '\n';
        retVal +='%%EOF\n';
        return retVal;
    }

    function createXrefTableAppend(xrefEntries) {
        xrefEntries = sortOnKeys(xrefEntries);

        var retVal ='xref\n';
        var last = -2;
        for(var i in xrefEntries) {
            i = parseInt(i);
            if(typeof xrefEntries[i].offset === 'undefined') { continue; }
            retVal += calcFlow(i, last, xrefEntries);
            var offset = xrefEntries[i].offset;
            retVal += pad10(offset)+' '+pad5(xrefEntries[i].gen)+' '+(xrefEntries[i].free?'f':'n')+' \n';
            last = i;
        }
        return retVal;
    }

    //http://stackoverflow.com/questions/10946880/sort-a-dictionary-or-whatever-key-value-data-structure-in-js-on-word-number-ke
    function sortOnKeys(dict) {
        var sorted = [];
        for(var key in dict) {
            sorted[sorted.length] = key;
        }
        sorted.sort();

        var tempDict = {};
        for(var i = 0; i < sorted.length; i++) {
            tempDict[sorted[i]] = dict[sorted[i]];
        }

        return tempDict;
    }

    function removeFromArray(array, from, to) {
        var cutlen = to - from;
        var buf = new Uint8Array(array.length - cutlen);

        for (var i = 0; i < from; i++) {
		    buf[i] = array[i];
        }
        for (var i = to, len = array.length; i < len; i++) {
		    buf[i-cutlen] = array[i];
        }
        return buf;
    }

    function findXrefBlocks(xrefBlocks) {
        var num = xrefBlocks.length / 2;
        var retVal = [];
        for (var i=0;i<num;i++) {
            retVal.push({start: xrefBlocks[i], end: xrefBlocks[i+num]});
        }
        return retVal;
    }

    function pad10(num) {
	    var s = "000000000" + num;
	    return s.substr(s.length-10);
	}

    function pad5(num) {
	    var s = "0000" + num;
	    return s.substr(s.length-5);
	}

    function pad2(num) {
	    var s = "0" + num;
	    return s.substr(s.length-2);
	}

    function findRootEntry(xref) {
        var rootNr = xref.root.objId.substring(0, xref.root.objId.length - 1);
        return xref.entries[rootNr];
	}

    function findSuccessorEntry(xrefEntries, current) {
        //find it first
        var currentOffset = current.offset;
        var currentMin = Number.MAX_SAFE_INTEGER;
        var currentMinIndex = -1;
        for(var i in xrefEntries) {
            if(xrefEntries[i].offset > currentOffset) {
                if(xrefEntries[i].offset < currentMin) {
                    currentMin = xrefEntries[i].offset;
                    currentMinIndex = i;
                }
            }
        }
        if(currentMinIndex === -1) {
            return current;
        }
        return xrefEntries[currentMinIndex];
    }

    function updateArray(array, pos, str) {
        var upd = stringToUint8Array(str);
        for (var i = 0, len=upd.length; i < len; i++) {
            array[i+pos] = upd[i];
        }
        return array;
	}

    function copyToEnd(array, from, to) {
        var buf = new Uint8Array(array.length + (to - from));
        for (var i = 0, len=array.length; i < len; i++) {
            buf[i] = array[i];
        }

        for (var i = 0, len=(to - from); i < len; i++) {
            buf[array.length + i] = array[from + i];
        }
        return buf;
    }

    function insertIntoArray(array, pos, str) {
        var ins = stringToUint8Array(str);
        var buf = new Uint8Array(array.length + ins.length);
        for (var i = 0; i < pos; i++) {
            buf[i] = array[i];
        }
        for (var i = 0; i < ins.length; i++) {
		    buf[pos+i] = ins[i];
        }
        for (var i = pos; i < array.length; i++) {
		    buf[ins.length+i] = array[i];
        }
        return buf;
	}

    function stringToUint8Array(str) {
        var buf = new Uint8Array(str.length);
        for (var i=0, strLen=str.length; i<strLen; i++) {
            buf[i] = str.charCodeAt(i);
        }
        return buf;
	}

    function findFreeXrefNr(xrefEntries, used) {
        used = typeof used !== 'undefined' ?  used : [];
        var inc = used.length;

        for (var i=1;i<xrefEntries.length;i++) {

            var index = used.indexOf(i);
            var entry = xrefEntries[""+i];
            if(index === -1 && (typeof entry === 'undefined' || entry.free)) {
                return i;
	    	}
            if(index !== -1) {
                inc--;
            }
	    }
        return xrefEntries.length + inc;
	}

    function find(uint8, needle, start, limit) {
        start = typeof start !== 'undefined' ? start : 0;
        limit = typeof limit !== 'undefined' ? limit : Number.MAX_SAFE_INTEGER;

        var search = stringToUint8Array(needle);
        var match = 0;

        for(var i=start;i<uint8.length && i<limit;i++) {
            if(uint8[i] === search[match]) {
                match++;
            } else {
                match = 0;
                if(uint8[i] === search[match]) {
                    match++;
                }
            }

            if(match === search.length) {
                return (i + 1) - match;
            }
        }
        return -1;
    }

    function findBackwards(uint8, needle, start, limit) {
        start = typeof start !== 'undefined' ? start : uint8.length;
        limit = typeof limit !== 'undefined' ? limit : Number.MAX_SAFE_INTEGER;

        var search = stringToUint8Array(needle);
        var match = search.length - 1;

        for(var i=start;i>=0 && i<limit;i--) {
            if(uint8[i] === search[match]) {
                match--;
            } else {
                match = search.length - 1;
                if(uint8[i] === search[match]) {
                    match--;
                }
            }

            if(match === 0) {
                return i - 1;
            }
        }
        return -1;
    }

    function isSigInRoot(pdf) {
        if (typeof pdf.acroForm === 'undefined') {
            return false;
        }
        return pdf.acroForm.get('SigFlags') === 3;
    }

    function updateXrefOffset(xref, offset, offsetDelta) {
        for(var i in xref.entries) {
            if(xref.entries[i].offset >= offset) {
                xref.entries[i].offset += offsetDelta;
            }
        }
        for(var i in xref.xrefBlocks) {
            if(xref.xrefBlocks[i] >= offset) {
                xref.xrefBlocks[i]  += offsetDelta;
            }
        }
    }

    function updateXrefBlocks(xrefBlocks, offset, offsetDelta) {
        for(var i in xrefBlocks) {
            if(xrefBlocks[i].start >= offset) {
                xrefBlocks[i].start += offsetDelta;
            }
            if(xrefBlocks[i].end >= offset) {
                xrefBlocks[i].end += offsetDelta;
            }
        }
    }

    function updateOffset(pos, offset, offsetDelta) {
        if(pos >= offset) {
            return pos + offsetDelta;
        }
        return pos;
    }

    function round256(x) {
        return (Math.ceil(x/256)*256) - 1;
    }
    /**
     * (D:YYYYMMDDHHmmSSOHH'mm)
     * e.g. (D:20151210164400+01'00')
     * where:
     * YYYY shall be the year
     * MM shall be the month (01–12)
     * DD shall be the day (01–31)
     * HH shall be the hour (00–23)
     * mm shall be the minute (00–59)
     * SS shall be the second (00–59)
     * O shall be the relationship of local time to Universal Time (UT), and shall be denoted by one of the characters PLUS SIGN (U+002B) (+), HYPHEN-MINUS (U+002D) (-), or LATIN CAPITAL LETTER Z (U+005A) (Z) (see below)
     * HH followed by APOSTROPHE (U+0027) (') shall be the absolute value of the offset from UT in hours (00–23)
     * mm shall be the absolute value of the offset from UT in minutes (00–59)
     */
    function now(date) {
        date = typeof date !== 'undefined' ? date : new Date();
        var yyyy = date.getFullYear().toString();
        var MM = pad2(date.getMonth() + 1);
        var dd = pad2(date.getDate());
        var hh = pad2(date.getHours());
        var mm = pad2(date.getMinutes());
        var ss = pad2(date.getSeconds());
        return yyyy + MM + dd+  hh + mm + ss + createOffset(date);
    }

    function createOffset(date) {
        var sign = (date.getTimezoneOffset() > 0) ? "-" : "+";
        var offset = Math.abs(date.getTimezoneOffset());
        var hours = pad2(Math.floor(offset / 60));
        var minutes = pad2(offset % 60);
        return sign + hours + "'" + minutes;
    }

    async function newSig(webcrypto, pdf, root, rootSuccessor, date, password) {
        //copy root and the entry with contents to the end
        var startRoot = pdf.stream.bytes.length + 1;

        var limit;
        if (root.offset == rootSuccessor.offset)
            limit = find(pdf.stream.bytes, 'endobj', root.offset) + 6;
        else
            limit = rootSuccessor.offset;

        var array = copyToEnd(pdf.stream.bytes, root.offset - 1, limit);

        //since we signed the first one, we know how the pdf has to look like:
        var offsetForm = find(array, '<<', startRoot) +2;

        var offsetAcroForm = find(array, '/AcroForm<</Fields', startRoot);
        var endOffsetAcroForm = find(array, ']', offsetAcroForm);

        var annotEntry = findFreeXrefNr(pdf.xref.entries);
        var sigEntry = findFreeXrefNr(pdf.xref.entries, [annotEntry]);

        var appendAnnot = ' ' + annotEntry + ' 0 R';
        var appendAnnots = '/Annots['+annotEntry+' 0 R]\n ';

        var appendAcroForm = '/AcroForm<</Fields['+annotEntry+' 0 R] /SigFlags 3>>';
        var array = insertIntoArray(array, offsetForm, appendAcroForm);

        // array = insertIntoArray(array, endOffsetAcroForm, appendAnnot);

        //we need to add Annots [x y R] to the /Type /Page section. We can do that by searching /Annots
        var pages = pdf.catalog.catDict.get('Pages');
        //get first page, we have hidden sig, so don't bother
        var contentRef = pages.get('Kids')[0]; // pages.get('Kids').length - 1
        var xref = pdf.xref.fetch(contentRef);
        // var offsetAnnotEnd = xref.get('#Annots_offset');
        //we now search ], this is safe as we signed it previously
        // var endOffsetAnnot = find(array, ']', offsetAnnotEnd);
        var xrefEntry = pdf.xref.getEntry(contentRef.num);
        var xrefEntrySuccosser = findSuccessorEntry(pdf.xref.entries, xrefEntry);
        // var offsetAnnotRelative = endOffsetAnnot - xrefEntrySuccosser.offset;
        var startContent = array.length;
        array = copyToEnd(array, xrefEntry.offset, xrefEntrySuccosser.offset);

        var offsetAnnot = find(array, '<<', startContent) + 2;


        array = insertIntoArray(array, offsetAnnot, appendAnnots);

        var startAnnot = array.length;
        var append = annotEntry + ' 0 obj\n<</F 132/Type/Annot/Subtype/Widget/Rect[0 0 0 0]/FT/Sig/DR<<>>/T(signature'+annotEntry+')/V '+sigEntry+' 0 R>>\nendobj\n\n';
        array = insertIntoArray(array, startAnnot, append);

        var startSig = array.length;
        var start = sigEntry+ ' 0 obj\n<</Contents <';
        //TODO: Adobe thinks its important to have the right size, no idea why this is the case
        var crypto = new Array(round256(1024 * 6)).join( '0' );
        var middle = '>\n/Type/Sig/SubFilter/adbe.pkcs7.detached/Location()/M(D:'+now(date)+'\')\n/ByteRange ';
        var byteRange = '[0000000000 0000000000 0000000000 0000000000]';
        var end = '/Filter/Adobe.PPKLite/Reason()/ContactInfo()>>\nendobj\n\n';
        //all together
        var append2 = start+crypto+middle+byteRange+end;
        array = insertIntoArray(array, startSig, append2);

        let sha256Buffer = await webcrypto.subtle.digest('SHA-256', array);
        let sha256Hex = pvutils.bufferToHexCodes(sha256Buffer);

        var prev = findBackwards(array, 'startxref', array.length-1);
        prev = findBackwards(array, 'xref', prev);

        // var prev = pdf.xref.xrefBlocks[0];

        var startxref = array.length;
        var xrefEntries = [];
        xrefEntries[0] = {offset:0, gen:65535, free:true};
        xrefEntries[pdf.xref.topDict.getRaw('Root').num] = {offset:startRoot, gen:0, free:false};
        xrefEntries[contentRef.num] = {offset:startContent, gen:0, free:false};
        xrefEntries[annotEntry] = {offset:startAnnot, gen:0, free:false};
        xrefEntries[sigEntry] = {offset:startSig, gen:0, free:false};
        var xrefTable = createXrefTableAppend(xrefEntries);
        xrefTable += createTrailer(pdf.xref.topDict, startxref, sha256Hex, xrefEntries.length, prev);
        array = insertIntoArray(array, array.length, xrefTable);

        var from1 = 0;
        var to1 = startSig + start.length;
        var from2 = to1 + crypto.length;
        var to2 = (array.length - from2) - 1;
        var byteRange = '['+pad10(from1)+' '+pad10(to1 - 1) + ' ' +pad10(from2 + 1)+ ' ' + pad10(to2) + ']';

        array = updateArray(array, from2 + middle.length, byteRange);

        return [array, [from1, to1 - 1, from2 +1, to2]];
    }
    async function appendSig(webcrypto, pdf, root, rootSuccessor, date, password) {
        //copy root and the entry with contents to the end
        var startRoot = pdf.stream.bytes.length + 1;

        var array = copyToEnd(pdf.stream.bytes, root.offset - 1, rootSuccessor.offset);

        //since we signed the first one, we know how the pdf has to look like:
        var offsetAcroForm = find(array, '/AcroForm<</Fields', startRoot);
        var endOffsetAcroForm = find(array, ']', offsetAcroForm);

        var annotEntry = findFreeXrefNr(pdf.xref.entries);
        var sigEntry = findFreeXrefNr(pdf.xref.entries, [annotEntry]);

        var appendAnnot = ' ' + annotEntry + ' 0 R';
        array = insertIntoArray(array, endOffsetAcroForm, appendAnnot);

        //we need to add Annots [x y R] to the /Type /Page section. We can do that by searching /Annots
        var pages = pdf.catalog.catDict.get('Pages');
        //get first page, we have hidden sig, so don't bother
        var contentRef = pages.get('Kids')[0];
        var xref = pdf.xref.fetch(contentRef);


        //we now search ], this is safe as we signed it previously

        var xrefEntry = pdf.xref.getEntry(contentRef.num);
        // var offsetAnnotEnd = xref.get('#Annots_offset');
        var offsetAnnotEnd = find(array, '/Annots',xrefEntry.offset);
        var endOffsetAnnot = find(array, ']', offsetAnnotEnd);

        var xrefEntrySuccosser = findSuccessorEntry(pdf.xref.entries, xrefEntry);
        var offsetAnnotRelative = endOffsetAnnot - xrefEntrySuccosser.offset;
        var startContent = array.length;
        array = copyToEnd(array, xrefEntry.offset, xrefEntrySuccosser.offset);
        array = insertIntoArray(array, array.length + offsetAnnotRelative, appendAnnot);

        var startAnnot = array.length;
        var append = annotEntry + ' 0 obj\n<</F 132/Type/Annot/Subtype/Widget/Rect[0 0 0 0]/FT/Sig/DR<<>>/T(signature'+annotEntry+')/V '+sigEntry+' 0 R>>\nendobj\n\n';
        array = insertIntoArray(array, startAnnot, append);

        var startSig = array.length;
        var start = sigEntry+ ' 0 obj\n<</Contents <';
        //TODO: Adobe thinks its important to have the right size, no idea why this is the case
        var crypto = new Array(round256(1024 * 6)).join( '0' );
        var middle = '>\n/Type/Sig/SubFilter/adbe.pkcs7.detached/Location()/M(D:'+now(date)+'\')\n/ByteRange ';
        var byteRange = '[0000000000 0000000000 0000000000 0000000000]';
        var end = '/Filter/Adobe.PPKLite/Reason()/ContactInfo()>>\nendobj\n\n';
        //all together
        var append2 = start+crypto+middle+byteRange+end;
        array = insertIntoArray(array, startSig, append2);

        let sha256Buffer = await webcrypto.subtle.digest('SHA-256', array);
        let sha256Hex = pvutils.bufferToHexCodes(sha256Buffer);


        var prev = findBackwards(array, 'startxref', array.length-1);
        prev = findBackwards(array, 'xref', prev);

        // var prev = pdf.xref.xrefBlocks[0];

        var startxref = array.length;
        var xrefEntries = [];
        xrefEntries[0] = {offset:0, gen:65535, free:true};
        xrefEntries[pdf.xref.topDict.getRaw('Root').num] = {offset:startRoot, gen:0, free:false};
        xrefEntries[contentRef.num] = {offset:startContent, gen:0, free:false};
        xrefEntries[annotEntry] = {offset:startAnnot, gen:0, free:false};
        xrefEntries[sigEntry] = {offset:startSig, gen:0, free:false};
        var xrefTable = createXrefTableAppend(xrefEntries);
        xrefTable += createTrailer(pdf.xref.topDict, startxref, sha256Hex, xrefEntries.length, prev);
        array = insertIntoArray(array, array.length, xrefTable);

        var from1 = 0;
        var to1 = startSig + start.length;
        var from2 = to1 + crypto.length;
        var to2 = (array.length - from2) - 1;
        var byteRange = '['+pad10(from1)+' '+pad10(to1 - 1) + ' ' +pad10(from2 + 1)+ ' ' + pad10(to2) + ']';

        array = updateArray(array, from2 + middle.length, byteRange);
        return [array, [from1, to1 - 1, from2 +1, to2]];
    }

    const api = {
        signpdfEmpty: function(pdfRaw, crypto){
            const date = new Date();

            let pdf = api.parsePDF(pdfRaw);
            var root = findRootEntry(pdf.xref);

            var rootSuccessor = findSuccessorEntry(pdf.xref.entries, root);

            if (!isSigInRoot(pdf)) {
                return newSig(crypto, pdf, root, rootSuccessor, date);
            } else {
                return appendSig(crypto, pdf, root, rootSuccessor, date);
            }
        },
        parsePDF: function(pdfRaw) {
            if (pdfRaw instanceof ArrayBuffer)
                pdfRaw = new Uint8Array(pdfRaw);

            let pdf = new PDFDocument({evaluatorOptions:{}}, pdfRaw);
            pdf.parseStartXRef();
            pdf.parse();
            return pdf;
        },
        setPDFDocument: function(_PDFDocument) {
            PDFDocument = _PDFDocument;
        }
    };
    api._removeFromArray = removeFromArray;
    api._updateArray = updateArray;
    return api;
}());

exports.PDFSIGN = PDFSIGN;
