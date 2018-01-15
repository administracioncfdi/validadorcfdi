'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _cadenaOriginal = require('./cadenaOriginal');

var _cadenaOriginal2 = _interopRequireDefault(_cadenaOriginal);

var _xmlParser = require('./xmlParser');

var _nodeForge = require('node-forge');

var _nodeForge2 = _interopRequireDefault(_nodeForge);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Converts given string to a SHA256 digest
 *
 * @param {string} toHash - String to be hashed
 * @return {string} sha256Digest
 */
function sha256Digest() {
  var toHash = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';

  var md = _nodeForge2.default.md.sha256.create();
  md.update(toHash, 'utf8');
  return md;
}

/**
 * Returns certificate object from a base 64 encoded certificate
 *
 * @param {string} certString - Base 64 string
 * @return {object} forge certificate object
 */
function getCertificateFromBase64() {
  var certString = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';

  if (!certString) return false;
  try {
    // base64-decode DER bytes
    var certDerBytes = _nodeForge2.default.util.decode64(certString);
    // parse DER to an ASN.1 object
    var obj = _nodeForge2.default.asn1.fromDer(certDerBytes);
    // convert ASN.1 object to forge certificate object
    var cert = _nodeForge2.default.pki.certificateFromAsn1(obj);
    return cert;
  } catch (e) {
    return false;
  }
}

/**
 * Returns public key from a base 64 encoded certificate
 *
 * @param {string} certString - Base 64 string
 * @return {string} Public Key
 */
function getPKFromBase64() {
  var certString = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';

  var cert = getCertificateFromBase64(certString);
  if (!cert) return false;
  // get forge public key object
  return cert.publicKey;
}

/**
 * Returns readable certificate from a DER (.cer) file
 *
 * @param {string} der - DER Certificate
 * @return {string} Public Key
 */
function getCertificateFromDer() {
  var der = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';

  if (!der) return false;
  try {
    var asnObj = _nodeForge2.default.asn1.fromDer(der);
    var asn1Cert = _nodeForge2.default.pki.certificateFromAsn1(asnObj);
    // PEM -> forge.pki.publicKeyToPem(asn1Cert.publicKey)
    return asn1Cert;
  } catch (e) {
    return false;
  }
}

/**
 * Certificates contain pairs, should remove first part of pair
 *
 * @param {string} serialNumber - certificate serial number to clean
 * @return {string} cleaned serial number
 */
function cleanCertificateSerialNumber() {
  var serialNumber = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';

  var cleanedCert = '';
  for (var i = 1; i < serialNumber.length; i += 2) {
    cleanedCert += serialNumber[i];
  }
  return cleanedCert;
}

/**
 * Clean carriage returns from a string
 *
 * @param {string} str - string to clean
 * @return {string} clean string
 */
function cleanSpecialCharacters() {
  var str = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';

  str = str.trim();
  return str.replace(/[\n\r]+/g, '');
}

/**
 * Returns basic factura and certificate information as an object
 * Note: this doesn't validate sellos
 *
 * @param {string} facturaXML - Factura to validate
 * @param {string} certificado - DER Certificate (.cer file)
 * @return {object} factura information
 */
async function composeResults() {
  var facturaXML = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';
  var certificado = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : '';

  var result = { valid: false, cadenaOriginal: {}, cadenaOriginalCC: {} };
  if (!facturaXML || !certificado) {
    result.message = 'Factura o certificado inexistente';
    return result;
  }
  var factura = (0, _xmlParser.parseXML)(facturaXML);

  if (!factura || factura.toString() === '') {
    result.message = 'Factura no pudo ser leída';
    return result;
  }

  var comprobante = factura.get('//cfdi:Comprobante', { cfdi: 'http://www.sat.gob.mx/cfd/3' });
  if (!comprobante) {
    result.message = 'Factura no contiene nodo Comprobante';
    return result;
  }
  result.version = comprobante.attr('Version') && comprobante.attr('Version').value() || '';
  result.certificadoEmisor = comprobante.attr('Certificado') && comprobante.attr('Certificado').value() || '';

  var timbreFiscalDigital = factura.get('//tfd:TimbreFiscalDigital', { tfd: 'http://www.sat.gob.mx/TimbreFiscalDigital' });
  if (!timbreFiscalDigital) {
    result.message = 'Factura no contiene Timbre Fiscal Digital';
    return result;
  }
  result.UUID = timbreFiscalDigital.attr('UUID') && timbreFiscalDigital.attr('UUID').value().toUpperCase() || '';
  result.selloCFD = timbreFiscalDigital.attr('SelloCFD') && timbreFiscalDigital.attr('SelloCFD').value() || '';
  result.selloSAT = timbreFiscalDigital.attr('SelloSAT') && timbreFiscalDigital.attr('SelloSAT').value() || '';

  var cadenaOriginal = await _cadenaOriginal2.default.generaCadena(facturaXML);
  result.cadenaOriginal.cadena = cadenaOriginal;
  result.cadenaOriginal.sha = sha256Digest(cadenaOriginal).digest().toHex();
  result.cadenaOriginal.certificadoUsado = comprobante.attr('NoCertificado') && comprobante.attr('NoCertificado').value() || '';
  result.cadenaOriginal.certificadoReportado = cleanCertificateSerialNumber(getCertificateFromBase64(result.certificadoEmisor).serialNumber);

  var cadenaOriginalCC = await _cadenaOriginal2.default.generaCadenaOriginalCC(facturaXML);
  result.cadenaOriginalCC.cadena = cadenaOriginalCC;
  result.cadenaOriginalCC.sha = sha256Digest(cadenaOriginalCC).digest().toHex();
  result.cadenaOriginalCC.certificadoUsado = cleanCertificateSerialNumber(getCertificateFromDer(certificado).serialNumber);
  result.cadenaOriginalCC.certificadoReportado = timbreFiscalDigital.attr('NoCertificadoSAT') && timbreFiscalDigital.attr('NoCertificadoSAT').value() || '';

  if (!result.certificadoEmisor || !result.selloCFD || !result.selloSAT) {
    result.message = 'Factura no contiene certificados correctos';
  }
  return result;
}

/**
 * Validates Sello Emisor with certificate
 *
 * @param {string} facturaXML - Factura to validate
 * @param {string} certificado - Base64 encoded certificate
 * @param {string} selloCFDI - SelloSAT from factura
 * @return {boolean} whether Sello Emisor is valid given the certificate
 */
async function validaSelloEmisor(facturaXML, certificado, selloCFDI) {
  certificado = cleanSpecialCharacters(certificado);
  selloCFDI = cleanSpecialCharacters(selloCFDI);
  if (!facturaXML || !certificado || !selloCFDI || selloCFDI.length !== 344 && selloCFDI.length !== 172) return false;
  var cadenaOriginal = await _cadenaOriginal2.default.generaCadena(facturaXML);
  if (!cadenaOriginal) return false;
  var cadenaOriginalHash = sha256Digest(cadenaOriginal);
  var publicKeyCert = getPKFromBase64(certificado);
  var signature = _nodeForge2.default.util.decode64(selloCFDI);
  if (!publicKeyCert || !signature) return false;
  var verificationResult = void 0;
  try {
    verificationResult = publicKeyCert.verify(cadenaOriginalHash.digest().bytes(), signature);
  } catch (e) {
    return false;
  }
  return verificationResult;
}

/**
 * Validates Sello SAT with certificate
 *
 * @param {string} facturaXML - Factura to validate
 * @param {string} certificadoSAT - DER Certificate (.cer file)
 * @param {string} selloSAT - SelloSAT from factura
 * @return {boolean} whether Sello SAT is valid given the certificate
 */
async function validaSelloSAT(facturaXML, certificadoSAT, selloSAT) {
  if (!facturaXML || !certificadoSAT || !selloSAT || selloSAT.length !== 344 && selloSAT.length !== 172) return false;
  var cadenaOriginalCC = await _cadenaOriginal2.default.generaCadenaOriginalCC(facturaXML);
  if (!cadenaOriginalCC) return false;
  var certificateDer = getCertificateFromDer(certificadoSAT);
  var publicKeyCert = certificateDer && certificateDer.publicKey;
  var signature = _nodeForge2.default.util.decode64(selloSAT);

  if (!publicKeyCert || !signature) return false;
  var cadenaOriginalHash = sha256Digest(cadenaOriginalCC);
  var verificationResult = void 0;
  try {
    verificationResult = publicKeyCert.verify(cadenaOriginalHash.digest().bytes(), signature);
  } catch (e) {
    return false;
  }
  return verificationResult;
}

/**
 * Checks that a factura is valid and returns all related information
 *
 * @param {string} facturaXML - Factura to validate
 * @param {string} certificadoSAT - DER Certificate (.cer file)
 * @return {object} factura information and validation result
 */
async function validaFactura(facturaXML, certificadoSAT) {
  // Read certificados, certificates and general values from factura
  var result = await composeResults(facturaXML, certificadoSAT);
  if (result.message) return result;
  var validaSelloEmisorResult = await validaSelloEmisor(facturaXML, result.certificadoEmisor, result.selloCFD);
  result.validaSelloEmisorResult = validaSelloEmisorResult;
  var validaSelloSATResult = await validaSelloSAT(facturaXML, certificadoSAT, result.selloSAT);
  result.validaSelloSATResult = validaSelloSATResult;
  result.valid = validaSelloEmisorResult && validaSelloSATResult;

  return result;
}

exports.default = {
  readFactura: composeResults,
  validaSelloEmisor: validaSelloEmisor,
  validaSelloSAT: validaSelloSAT,
  validaFactura: validaFactura
};