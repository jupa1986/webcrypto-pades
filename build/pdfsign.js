'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var newSig = function () {
    var _ref = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(webcrypto, pdf, root, rootSuccessor, date, password) {
        var startRoot, annotEntry, sigEntry, appendAnnot, limit, acroForm, array, appendAcroForm, offsetForm, offsetAcroForm, endOffsetAcroForm, objId, _xrefEntry, xrefEntrySuccessor, offsetFields, endOffsetFields, offsetSigFlags, pages, contentRef, xref, xrefEntry, startContent, offsetAnnot, subAnnots, offsetAnnotEnd, offsetAnnotPartial, _buffer, _ubuffer, _j, i, _prevStr, xrefOffset, startAnnot, append, startSig, start, crypto, middle, byteRange, end, append2, sha256Buffer, sha256Hex, prev, eof, buffer, ubuffer, j, _i, prevStr, startxref, xrefEntries, xrefTable, from1, to1, from2, to2;

        return regeneratorRuntime.wrap(function _callee$(_context) {
            while (1) {
                switch (_context.prev = _context.next) {
                    case 0:
                        //copy root and the entry with contents to the end
                        startRoot = pdf.stream.bytes.length + 1;
                        annotEntry = findFreeXrefNr(pdf.xref.entries);
                        sigEntry = findFreeXrefNr(pdf.xref.entries, [annotEntry]);
                        appendAnnot = ' ' + annotEntry + ' 0 R';

                        if (root.offset == rootSuccessor.offset) limit = find(pdf.stream.bytes, 'endobj', root.offset) + 7;else limit = rootSuccessor.offset;

                        acroForm = pdf.xref.root.get("AcroForm");

                        if (!(typeof acroForm === "undefined")) {
                            _context.next = 13;
                            break;
                        }

                        // New sign
                        array = copyToEnd(pdf.stream.bytes, root.offset - 1, limit);
                        appendAcroForm = '/AcroForm<</Fields[' + appendAnnot + '] /SigFlags 3>>';
                        //since we signed the first one, we know how the pdf has to look like:

                        offsetForm = find(array, '<<', startRoot) + 2;

                        array = insertIntoArray(array, offsetForm, appendAcroForm);
                        _context.next = 35;
                        break;

                    case 13:
                        if (!(acroForm.get("Fields").length > 0 && pdf.acroForm.get('SigFlags') === 3)) {
                            _context.next = 20;
                            break;
                        }

                        array = copyToEnd(pdf.stream.bytes, root.offset - 1, limit);
                        offsetAcroForm = find(array, '/AcroForm<</Fields', startRoot); // TODO: fixme

                        endOffsetAcroForm = find(array, ']', offsetAcroForm);

                        array = insertIntoArray(array, endOffsetAcroForm, appendAnnot);
                        _context.next = 35;
                        break;

                    case 20:
                        if (!(acroForm.objId != null)) {
                            _context.next = 34;
                            break;
                        }

                        objId = acroForm.objId.substring(0, acroForm.objId.length - 1);
                        _xrefEntry = pdf.xref.getEntry(objId);

                        if (!(typeof _xrefEntry.uncompressed == 'undefined')) {
                            _context.next = 25;
                            break;
                        }

                        throw new Error("PDF no soportado!");

                    case 25:
                        xrefEntrySuccessor = findSuccessorEntry(pdf.xref.entries, _xrefEntry);
                        // TODO: fixme

                        array = copyToEnd(pdf.stream.bytes, _xrefEntry.offset - 1, xrefEntrySuccessor.offset);
                        offsetFields = find(array, '/Fields', startRoot);
                        endOffsetFields = find(array, ']', offsetFields);
                        offsetSigFlags = find(array, 'SigFlags', offsetFields);

                        if (offsetSigFlags < 0) {
                            array = insertIntoArray(array, endOffsetFields + 1, '/SigFlags 3');
                        }
                        array = insertIntoArray(array, endOffsetFields, appendAnnot);
                        _context.next = 35;
                        break;

                    case 34:
                        throw new Error("PDF no soportado!");

                    case 35:

                        //we need to add Annots [x y R] to the /Type /Page section. We can do that by searching /Annots
                        pages = pdf.catalog.catDict.get('Pages');
                        //get first page, we have hidden sig, so don't bother

                        contentRef = pages.get('Kids')[0]; // pages.get('Kids').length - 1

                        xref = pdf.xref.fetch(contentRef);

                        if (xref.get('Kids') != undefined) {
                            contentRef = xref.get('Kids')[0];
                        }
                        // var offsetAnnotEnd = xref.get('#Annots_offset');
                        //we now search ], this is safe as we signed it previously
                        // var endOffsetAnnot = find(array, ']', offsetAnnotEnd);
                        xrefEntry = pdf.xref.getEntry(contentRef.num);

                        if (!(typeof xrefEntry.uncompressed == 'undefined')) {
                            _context.next = 42;
                            break;
                        }

                        throw new Error("PDF no soportado!");

                    case 42:
                        xrefEntrySuccessor = findSuccessorEntry(pdf.xref.entries, xrefEntry);
                        // var offsetAnnotRelative = endOffsetAnnot - xrefEntrySuccessor.offset;

                        startContent = array.length;
                        offsetAnnot = find(array, '/Annots', xrefEntry.offset, xrefEntrySuccessor.offset);
                        subAnnots = false;

                        if (!(offsetAnnot > 0)) {
                            _context.next = 60;
                            break;
                        }

                        offsetAnnot += 7;
                        offsetAnnotEnd = find(array, '/', offsetAnnot, xrefEntrySuccessor.offset);
                        offsetAnnotPartial = find(array, ']', offsetAnnot, offsetAnnotEnd);

                        if (!(offsetAnnotPartial < 0)) {
                            _context.next = 60;
                            break;
                        }

                        _buffer = new ArrayBuffer(offsetAnnotEnd - offsetAnnot);
                        _ubuffer = new Uint8Array(_buffer);
                        _j = 0;

                        for (i = offsetAnnot; i < offsetAnnotEnd; i++) {
                            _ubuffer[_j++] = array[i];
                        }_prevStr = String.fromCharCode.apply(null, _ubuffer);
                        xrefOffset = parseInt(_prevStr.match(/\d+/)[0]);

                        xrefEntry = pdf.xref.getEntry(xrefOffset);
                        xrefEntrySuccessor = findSuccessorEntry(pdf.xref.entries, xrefEntry);
                        // FIXME
                        throw new Error("PDF no soportado!");

                    case 60:
                        array = copyToEnd(array, xrefEntry.offset, xrefEntrySuccessor.offset);
                        // Find /Annots
                        offsetAnnot = find(array, '/Annots', startContent);
                        if (offsetAnnot < 0) {
                            offsetAnnot = find(array, '<<', startContent) + 2;
                            appendAnnot = '/Annots[' + appendAnnot + ']\n ';
                        } else {
                            offsetAnnot = find(array, ']', offsetAnnot); // TODO
                        }

                        array = insertIntoArray(array, offsetAnnot, appendAnnot);
                        startAnnot = array.length;
                        append = annotEntry + ' 0 obj\n<</F 132/Type/Annot/Subtype/Widget/Rect[0 0 0 0]/FT/Sig/DR<<>>/T(signature' + annotEntry + ')/V ' + sigEntry + ' 0 R>>\nendobj\n\n';

                        array = insertIntoArray(array, startAnnot, append);

                        startSig = array.length;
                        start = sigEntry + ' 0 obj\n<</Contents <';
                        //TODO: Adobe thinks its important to have the right size, no idea why this is the case

                        crypto = new Array(round256(1024 * 6)).join('0');
                        middle = '>\n/Type/Sig/SubFilter/adbe.pkcs7.detached/Location()/M(D:' + now(date) + '\')\n/ByteRange ';
                        byteRange = '[0000000000 0000000000 0000000000 0000000000]';
                        end = '/Filter/Adobe.PPKLite/Reason()/ContactInfo()>>\nendobj\n\n';
                        //all together

                        append2 = start + crypto + middle + byteRange + end;

                        array = insertIntoArray(array, startSig, append2);

                        _context.next = 77;
                        return webcrypto.subtle.digest('SHA-256', array);

                    case 77:
                        sha256Buffer = _context.sent;
                        sha256Hex = (0, _pvutils.bufferToHexCodes)(sha256Buffer);
                        prev = findBackwards(array, 'startxref', array.length - 1);
                        // prev = findBackwards(array, 'xref', prev);
                        //TODO: fixme

                        eof = find(array, '%%EOF', prev);
                        buffer = new ArrayBuffer(eof - prev);
                        ubuffer = new Uint8Array(buffer);
                        j = 0;

                        for (_i = prev; _i < eof; _i++) {
                            ubuffer[j++] = array[_i];
                        }prevStr = String.fromCharCode.apply(null, ubuffer);
                        xrefOffset = parseInt(prevStr.match(/\d+/)[0]);

                        if (!(find(array, 'xref', xrefOffset, xrefOffset + 7) < 0)) {
                            _context.next = 89;
                            break;
                        }

                        throw new Error("PDF no soportado!");

                    case 89:

                        prev = xrefOffset;

                        startxref = array.length;
                        xrefEntries = [];

                        xrefEntries[0] = { offset: 0, gen: 65535, free: true };
                        xrefEntries[pdf.xref.topDict.getRaw('Root').num] = { offset: startRoot, gen: 0, free: false };
                        xrefEntries[contentRef.num] = { offset: startContent, gen: 0, free: false };
                        xrefEntries[annotEntry] = { offset: startAnnot, gen: 0, free: false };
                        xrefEntries[sigEntry] = { offset: startSig, gen: 0, free: false };
                        xrefTable = createXrefTableAppend(xrefEntries);

                        xrefTable += createTrailer(pdf.xref.topDict, startxref, sha256Hex, xrefEntries.length, prev);
                        array = insertIntoArray(array, array.length, xrefTable);

                        from1 = 0;
                        to1 = startSig + start.length;
                        from2 = to1 + crypto.length;
                        to2 = array.length - from2 - 1;
                        byteRange = '[' + pad10(from1) + ' ' + pad10(to1 - 1) + ' ' + pad10(from2 + 1) + ' ' + pad10(to2) + ']';


                        array = updateArray(array, from2 + middle.length, byteRange);

                        return _context.abrupt('return', [array, [from1, to1 - 1, from2 + 1, to2]]);

                    case 107:
                    case 'end':
                        return _context.stop();
                }
            }
        }, _callee, this);
    }));

    return function newSig(_x, _x2, _x3, _x4, _x5, _x6) {
        return _ref.apply(this, arguments);
    };
}();

exports.removeFromArray = removeFromArray;
exports.updateArray = updateArray;
exports.signpdfEmpty = signpdfEmpty;
exports.parsePDF = parsePDF;
exports.setPDFDocument = setPDFDocument;

var _pvutils = require('pvutils');

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; } /*
                                                                                                                                                                                                                                                                                                                                                                                                                                                                            * PDFSign v1.0.0
                                                                                                                                                                                                                                                                                                                                                                                                                                                                            * https://github.com/Communication-Systems-Group/pdfsign.js
                                                                                                                                                                                                                                                                                                                                                                                                                                                                            *
                                                                                                                                                                                                                                                                                                                                                                                                                                                                            * Copyright 2015, Thomas Bocek, University of Zurich
                                                                                                                                                                                                                                                                                                                                                                                                                                                                            * Copyright 2018, Juan Carlos Canaza Ayarachi, jccarlos.a@gmail.com
                                                                                                                                                                                                                                                                                                                                                                                                                                                                            *
                                                                                                                                                                                                                                                                                                                                                                                                                                                                            * Licensed under the MIT license:
                                                                                                                                                                                                                                                                                                                                                                                                                                                                            * http://www.opensource.org/licenses/MIT
                                                                                                                                                                                                                                                                                                                                                                                                                                                                            */

var PDFDocument = void 0;

function createXrefTable(xrefEntries) {
    xrefEntries = sortOnKeys(xrefEntries);
    var retVal = 'xref\n';
    var last = -2;
    for (var i in xrefEntries) {
        i = parseInt(i);
        if (typeof xrefEntries[i].offset === 'undefined') {
            continue;
        }
        retVal += calcFlow(i, last, xrefEntries);
        var offset = xrefEntries[i].offset;
        retVal += pad10(offset) + ' ' + pad5(xrefEntries[i].gen) + ' ' + (xrefEntries[i].free ? 'f' : 'n') + ' \n';
        last = i;
    }
    return retVal;
}

function calcFlow(i, last, xrefEntries) {
    if (last + 1 === i) {
        return '';
    }
    var count = 1;
    while (typeof xrefEntries[i + count] !== 'undefined' && typeof xrefEntries[i + count].offset !== 'undefined') {
        count++;
    }
    return i + ' ' + count + '\n';
}

function createTrailer(topDict, startxref, sha256Hex, size, prev) {
    var retVal = 'trailer <<\n';
    retVal += '  /Size ' + size + '\n';
    var refRoot = topDict.getRaw('Root');
    if (typeof refRoot !== 'undefined') {
        retVal += '  /Root ' + refRoot.num + ' ' + refRoot.gen + ' R\n';
    }
    var refInfo = topDict.getRaw('Info');
    if (typeof refInfo !== 'undefined') {
        retVal += '  /Info ' + refInfo.num + ' ' + refInfo.gen + ' R\n';
    }
    retVal += '  /ID [<' + sha256Hex.substring(0, 32) + '><' + sha256Hex.substring(32, 64) + '>]\n';
    if (typeof prev !== 'undefined') {
        retVal += '  /Prev ' + prev + '\n';
    }
    retVal += '>>\n';
    retVal += 'startxref\n';
    retVal += startxref + '\n';
    retVal += '%%EOF\n';
    return retVal;
}

function createXrefTableAppend(xrefEntries) {
    xrefEntries = sortOnKeys(xrefEntries);

    var retVal = 'xref\n';
    var last = -2;
    for (var i in xrefEntries) {
        i = parseInt(i);
        if (typeof xrefEntries[i].offset === 'undefined') {
            continue;
        }
        retVal += calcFlow(i, last, xrefEntries);
        var offset = xrefEntries[i].offset;
        retVal += pad10(offset) + ' ' + pad5(xrefEntries[i].gen) + ' ' + (xrefEntries[i].free ? 'f' : 'n') + ' \n';
        last = i;
    }
    return retVal;
}

//http://stackoverflow.com/questions/10946880/sort-a-dictionary-or-whatever-key-value-data-structure-in-js-on-word-number-ke
function sortOnKeys(dict) {
    var sorted = [];
    for (var key in dict) {
        sorted[sorted.length] = key;
    }
    sorted.sort();

    var tempDict = {};
    for (var i = 0; i < sorted.length; i++) {
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
        buf[i - cutlen] = array[i];
    }
    return buf;
}

function pad10(num) {
    var s = "000000000" + num;
    return s.substr(s.length - 10);
}

function pad5(num) {
    var s = "0000" + num;
    return s.substr(s.length - 5);
}

function pad2(num) {
    var s = "0" + num;
    return s.substr(s.length - 2);
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
    for (var i in xrefEntries) {
        if (typeof xrefEntries[i].uncompressed != 'boolean') continue;
        if (xrefEntries[i].offset > currentOffset) {
            if (xrefEntries[i].offset < currentMin) {
                currentMin = xrefEntries[i].offset;
                currentMinIndex = i;
            }
        }
    }
    if (currentMinIndex === -1) {
        return current;
    }
    return xrefEntries[currentMinIndex];
}

function updateArray(array, pos, str) {
    var upd = stringToUint8Array(str);
    for (var i = 0, len = upd.length; i < len; i++) {
        array[i + pos] = upd[i];
    }
    return array;
}

function copyToEnd(array, from, to) {
    var buf = new Uint8Array(array.length + (to - from));
    for (var i = 0, len = array.length; i < len; i++) {
        buf[i] = array[i];
    }

    for (var i = 0, len = to - from; i < len; i++) {
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
        buf[pos + i] = ins[i];
    }
    for (var i = pos; i < array.length; i++) {
        buf[ins.length + i] = array[i];
    }
    return buf;
}

function stringToUint8Array(str) {
    var buf = new Uint8Array(str.length);
    for (var i = 0, strLen = str.length; i < strLen; i++) {
        buf[i] = str.charCodeAt(i);
    }
    return buf;
}

function findFreeXrefNr(xrefEntries, used) {
    used = typeof used !== 'undefined' ? used : [];
    var inc = used.length;

    for (var i = 1; i < xrefEntries.length; i++) {

        var index = used.indexOf(i);
        var entry = xrefEntries["" + i];
        if (index === -1 && (typeof entry === 'undefined' || entry.free)) {
            return i;
        }
        if (index !== -1) {
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

    for (var i = start; i < uint8.length && i < limit; i++) {
        if (uint8[i] === search[match]) {
            match++;
        } else {
            match = 0;
            if (uint8[i] === search[match]) {
                match++;
            }
        }

        if (match === search.length) {
            return i + 1 - match;
        }
    }
    return -1;
}

function findBackwards(uint8, needle, start, limit) {
    start = typeof start !== 'undefined' ? start : uint8.length;
    limit = typeof limit !== 'undefined' ? limit : Number.MAX_SAFE_INTEGER;

    var search = stringToUint8Array(needle);
    var match = search.length - 1;

    for (var i = start; i >= 0 && i < limit; i--) {
        if (uint8[i] === search[match]) {
            match--;
        } else {
            match = search.length - 1;
            if (uint8[i] === search[match]) {
                match--;
            }
        }

        if (match === 0) {
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

function round256(x) {
    return Math.ceil(x / 256) * 256 - 1;
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
    return yyyy + MM + dd + hh + mm + ss + createOffset(date);
}

function createOffset(date) {
    var sign = date.getTimezoneOffset() > 0 ? "-" : "+";
    var offset = Math.abs(date.getTimezoneOffset());
    var hours = pad2(Math.floor(offset / 60));
    var minutes = pad2(offset % 60);
    return sign + hours + "'" + minutes;
}

function signpdfEmpty(pdfRaw, crypto) {
    var date = new Date();

    var pdf = parsePDF(pdfRaw);
    var root = findRootEntry(pdf.xref);

    if (typeof root.uncompressed == 'undefined') throw new Error("PDF no soportado!");

    var rootSuccessor = findSuccessorEntry(pdf.xref.entries, root);
    return newSig(crypto, pdf, root, rootSuccessor, date);
}

function parsePDF(pdfRaw) {
    if (pdfRaw instanceof ArrayBuffer) pdfRaw = new Uint8Array(pdfRaw);
    var pdf = new PDFDocument({ evaluatorOptions: {} }, pdfRaw);
    try {
        pdf.parseStartXRef();
        pdf.parse();
    } catch (err) {
        throw new Error("PDF no soportado!");
    }
    return pdf;
}

function setPDFDocument(_PDFDocument) {
    PDFDocument = _PDFDocument;
}