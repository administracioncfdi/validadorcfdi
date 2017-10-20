import cadena from './cadenaOriginal'
import forge from 'node-forge'

/**
 * Converts given string to a SHA256 digest
 *
 * @param {string} toHash - String to be hashed
 * @return {string} sha256Digest
 */
function sha256Digest (toHash = '') {
  let md = forge.md.sha256.create()
  md.update(toHash, 'utf8')
  return md
}

/**
 * Returns public key from a base 64 encoded string
 *
 * @param {string} certString - Base 64 string
 * @return {string} Public Key
 */
function getPKFromBase64 (certString = '') {
  if (!certString) return false
  try {
    // base64-decode DER bytes
    let certDerBytes = forge.util.decode64(certString)
    // parse DER to an ASN.1 object
    let obj = forge.asn1.fromDer(certDerBytes)
    // convert ASN.1 object to forge certificate object
    let cert = forge.pki.certificateFromAsn1(obj)
    // get forge public key object
    return cert.publicKey
  } catch (e) {
    return false
  }
}

/**
 * Returns public key from a DER (.cer) certificate
 *
 * @param {string} der - DER Certificate
 * @return {string} Public Key
 */
function getPKFromDer (der = '') {
  if (!der) return false
  try {
    let asnObj = forge.asn1.fromDer(der)
    let asn1Cert = forge.pki.certificateFromAsn1(asnObj)
    // PEM -> forge.pki.publicKeyToPem(asn1Cert.publicKey)
    return asn1Cert.publicKey
  } catch (e) {
    return false
  }
}

export default {
  validaSelloEmisor: async (facturaXML, certificado, selloCFDI) => {
    if (!facturaXML || !certificado || !selloCFDI || selloCFDI.length !== 344) return false
    const cadenaOriginal = await cadena.generaCadena(facturaXML)
    if (!cadenaOriginal) return false
    const cadenaOriginalHash = sha256Digest(cadenaOriginal)
    const publicKeyCert = getPKFromBase64(certificado)
    const signature = forge.util.decode64(selloCFDI)
    if (!publicKeyCert || !signature) return false
    return publicKeyCert.verify(cadenaOriginalHash.digest().bytes(), signature)
  },
  validaSelloSAT: async (facturaXML, certificadoDER, selloSAT) => {
    if (!facturaXML || !certificadoDER || !selloSAT || selloSAT.length !== 344) return false
    const cadenaOriginalCC = await cadena.generaCadenaOriginalCC(facturaXML)
    if (!cadenaOriginalCC) return false
    const cadenaOriginalHash = sha256Digest(cadenaOriginalCC)
    const publicKeyCert = getPKFromDer(certificadoDER)
    const signature = forge.util.decode64(selloSAT)
    if (!publicKeyCert || !signature) return false
    return publicKeyCert.verify(cadenaOriginalHash.digest().bytes(), signature)
  },
  validaFactura: async (facturaXML, certificado) => {
    return this.validaSelloEmisor(facturaXML) && this.validaSelloSAT(facturaXML)
  }
}
