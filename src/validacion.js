import cadena from './cadenaOriginal'
import { parseXML } from './xmlParser'
import { downloadCertificateById } from './certificado'
import forge from 'node-forge'

/**
 * Converts given string to a SHA256 digest
 *
 * @param {string} toHash - String to be hashed
 * @return {string} sha256Digest
 */
function sha256Digest (toHash = '') {
  const md = forge.md.sha256.create()
  md.update(toHash, 'utf8')
  return md
}

/**
 * Returns certificate object from a base 64 encoded certificate
 *
 * @param {string} certString - Base 64 string
 * @return {object} forge certificate object
 */
function getCertificateFromBase64 (certString = '') {
  if (!certString) return false
  try {
    // base64-decode DER bytes
    const certDerBytes = forge.util.decode64(certString)
    // parse DER to an ASN.1 object
    const obj = forge.asn1.fromDer(certDerBytes)
    // convert ASN.1 object to forge certificate object
    const cert = forge.pki.certificateFromAsn1(obj)
    return cert
  } catch (e) {
    return false
  }
}

/**
 * Returns public key from a base 64 encoded certificate
 *
 * @param {string} certString - Base 64 string
 * @return {string} Public Key
 */
function getPKFromBase64 (certString = '') {
  const cert = getCertificateFromBase64(certString)
  if (!cert) return false
  // get forge public key object
  return cert.publicKey
}

/**
 * Returns readable certificate from a DER (.cer) file
 *
 * @param {string} der - DER Certificate
 * @return {string} Public Key
 */
function getCertificateFromDer (der = '') {
  if (!der) return false
  try {
    const asnObj = forge.asn1.fromDer(der)
    const asn1Cert = forge.pki.certificateFromAsn1(asnObj)
    // PEM -> forge.pki.publicKeyToPem(asn1Cert.publicKey)
    return asn1Cert
  } catch (e) {
    return false
  }
}

/**
 * Returns Certificado Number (ID) from a given factura
 *
 * @param {object} factura - libxml object
 * @return {string} ID NoCertificadoSAT
 */
function getCertificadoSATFromFactura (factura) {
  const timbreFiscalDigital = factura.get('//tfd:TimbreFiscalDigital', { tfd: 'http://www.sat.gob.mx/TimbreFiscalDigital' })
  if (!timbreFiscalDigital) {
    return false
  }
  return (timbreFiscalDigital.attr('NoCertificadoSAT') && timbreFiscalDigital.attr('NoCertificadoSAT').value()) || false
}

/**
 * Certificates contain pairs, should remove first part of pair
 *
 * @param {string} serialNumber - certificate serial number to clean
 * @return {string} cleaned serial number
 */
function cleanCertificateSerialNumber (serialNumber = '') {
  let cleanedCert = ''
  for (let i = 1; i < serialNumber.length; i += 2) {
    cleanedCert += serialNumber[i]
  }
  return cleanedCert
}

/**
 * Clean carriage returns from a string
 *
 * @param {string} str - string to clean
 * @return {string} clean string
 */
function cleanSpecialCharacters (str = '') {
  str = str.trim()
  return str.replace(/[\s\n\r]+/g, '')
}

/**
 * Returns basic factura and certificate information as an object
 * Note: this doesn't validate sellos
 *
 * @param {string} factura - Factura to validate
 * @param {object} parsedFactura - libxml object of parsedFactura
 * @param {string} certificado - DER Certificate (.cer file)
 * @return {object} factura information
 */
async function composeResults (facturaXML = '', parsedFactura = '', certificado = '') {
  const result = { valid: false, cadenaOriginal: {}, cadenaOriginalCC: {} }
  if (!facturaXML || !certificado) {
    result.message = 'Factura o certificado inexistente'
    return result
  }
  const factura = parsedFactura || parseXML(facturaXML)

  if (!factura || factura.toString() === '') {
    result.message = 'Factura no pudo ser leída'
    return result
  }
  const cfdi3Namespace = { cfdi: 'http://www.sat.gob.mx/cfd/3' }
  const cfdi4Namespace = { cfdi: 'http://www.sat.gob.mx/cfd/4' }
  const comprobante = factura.get('//cfdi:Comprobante', cfdi3Namespace) || factura.get('//cfdi:Comprobante', cfdi4Namespace)
  if (!comprobante) {
    result.message = 'Factura no contiene nodo Comprobante'
    return result
  }
  result.version = (comprobante.attr('Version') && comprobante.attr('Version').value()) || ''
  result.certificadoEmisor = (comprobante.attr('Certificado') && comprobante.attr('Certificado').value()) || ''
  result.certificadoEmisor = cleanSpecialCharacters(result.certificadoEmisor)

  const timbreFiscalDigital = factura.get('//tfd:TimbreFiscalDigital', { tfd: 'http://www.sat.gob.mx/TimbreFiscalDigital' })
  if (!timbreFiscalDigital) {
    result.message = 'Factura no contiene Timbre Fiscal Digital'
    return result
  }
  result.UUID = (timbreFiscalDigital.attr('UUID') && timbreFiscalDigital.attr('UUID').value().toUpperCase()) || ''
  result.selloCFD = (timbreFiscalDigital.attr('SelloCFD') && timbreFiscalDigital.attr('SelloCFD').value()) || ''
  result.selloCFD = cleanSpecialCharacters(result.selloCFD)
  result.selloSAT = (timbreFiscalDigital.attr('SelloSAT') && timbreFiscalDigital.attr('SelloSAT').value()) || ''
  result.selloSAT = cleanSpecialCharacters(result.selloSAT)

  const cadenaOriginal = await cadena.generaCadena(facturaXML, result.version)
  result.cadenaOriginal.cadena = cadenaOriginal
  result.cadenaOriginal.sha = sha256Digest(cadenaOriginal).digest().toHex()
  result.cadenaOriginal.certificadoUsado = (comprobante.attr('NoCertificado') && comprobante.attr('NoCertificado').value()) || ''
  result.cadenaOriginal.certificadoReportado = cleanCertificateSerialNumber(getCertificateFromBase64(result.certificadoEmisor).serialNumber)

  const cadenaOriginalCC = await cadena.generaCadenaOriginalCC(facturaXML)
  result.cadenaOriginalCC.cadena = cadenaOriginalCC
  result.cadenaOriginalCC.sha = sha256Digest(cadenaOriginalCC).digest().toHex()

  result.cadenaOriginalCC.certificadoUsado = cleanCertificateSerialNumber(getCertificateFromDer(certificado).serialNumber)
  result.cadenaOriginalCC.certificadoReportado = (timbreFiscalDigital.attr('NoCertificadoSAT') && timbreFiscalDigital.attr('NoCertificadoSAT').value()) || ''

  if (!result.certificadoEmisor || !result.selloCFD || !result.selloSAT) {
    result.message = 'Factura no contiene certificados correctos'
  }
  return result
}

/**
 * Validates Sello Emisor with certificate
 *
 * @param {string} facturaXML - Factura to validate
 * @param {string} certificado - Base64 encoded certificate
 * @param {string} selloCFDI - SelloSAT from factura
 * @param {string} version - Factura version ('3.3' || '4.0')
 * @return {boolean} whether Sello Emisor is valid given the certificate
 */
async function validaSelloEmisor (facturaXML, certificado, selloCFDI, version) {
  certificado = cleanSpecialCharacters(certificado)
  selloCFDI = cleanSpecialCharacters(selloCFDI)
  if (!facturaXML || !certificado || !selloCFDI || (selloCFDI.length !== 344 && selloCFDI.length !== 172)) return false
  const cadenaOriginal = await cadena.generaCadena(facturaXML, version)
  if (!cadenaOriginal) return false
  const cadenaOriginalHash = sha256Digest(cadenaOriginal)
  const publicKeyCert = getPKFromBase64(certificado)
  const signature = forge.util.decode64(selloCFDI)
  if (!publicKeyCert || !signature) return false
  let verificationResult
  try {
    verificationResult = publicKeyCert.verify(cadenaOriginalHash.digest().bytes(), signature)
  } catch (e) {
    return false
  }
  return verificationResult
}

/**
 * Validates Sello SAT with certificate
 *
 * @param {string} facturaXML - Factura to validate
 * @param {string} certificadoSAT - DER Certificate (.cer file)
 * @param {string} selloSAT - SelloSAT from factura
 * @return {boolean} whether Sello SAT is valid given the certificate
 */
async function validaSelloSAT (facturaXML, certificadoSAT, selloSAT) {
  if (!facturaXML || !certificadoSAT || !selloSAT || (selloSAT.length !== 344 && selloSAT.length !== 172)) return false
  const cadenaOriginalCC = await cadena.generaCadenaOriginalCC(facturaXML)
  if (!cadenaOriginalCC) return false
  const certificateDer = getCertificateFromDer(certificadoSAT)
  const publicKeyCert = certificateDer && certificateDer.publicKey
  const signature = forge.util.decode64(selloSAT)

  if (!publicKeyCert || !signature) return false
  const cadenaOriginalHash = sha256Digest(cadenaOriginalCC)
  let verificationResult
  try {
    verificationResult = publicKeyCert.verify(cadenaOriginalHash.digest().bytes(), signature)
  } catch (e) {
    return false
  }
  return verificationResult
}

/**
 * Checks that a factura is valid and returns all related information
 *
 * @param {string} facturaXML - Factura to validate
 * @param {string} certificadoSAT - Optional DER Certificate (.cer file)
 * @return {object} factura information and validation result
 */
async function validaFactura (facturaXML, certificadoSAT = '') {
  // Parse factura
  const factura = parseXML(facturaXML)
  if (!certificadoSAT) {
    const id = getCertificadoSATFromFactura(factura)
    try {
      certificadoSAT = await downloadCertificateById(id)
    } catch (error) {
      return { valid: false, message: 'Certificado no pudo ser descargado del portal del SAT', cadenaOriginal: {}, cadenaOriginalCC: {} }
    }
    certificadoSAT = certificadoSAT.toString('binary')
  }
  // Read certificados, certificates and general values from factura
  const result = await composeResults(facturaXML, factura, certificadoSAT)
  if (result.message) return result
  const validaSelloEmisorResult = await validaSelloEmisor(facturaXML, result.certificadoEmisor, result.selloCFD, result.version)
  result.validaSelloEmisorResult = validaSelloEmisorResult
  const validaSelloSATResult = await validaSelloSAT(facturaXML, certificadoSAT, result.selloSAT)
  result.validaSelloSATResult = validaSelloSATResult
  result.valid = validaSelloEmisorResult && validaSelloSATResult

  return result
}

export default {
  readFactura: composeResults,
  validaSelloEmisor,
  validaSelloSAT,
  validaFactura
}
