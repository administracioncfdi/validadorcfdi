import libxslt from 'libxslt'
import { parseXML } from './xmlParser'
import path from 'path'
import fs from 'fs'

const cadenaPath = path.join(__dirname, 'xslt', 'cfd', '3', 'cadenaoriginal_3_3', 'cadenaoriginal_3_3.xslt')

/**
 * Converts a callback to a promise, used for async/await
 *
 * @function
 * @param {...*} args - Arguments
 * @return {Promise} Callback converted to promise
 */
function callbackToPromise (method, ...args) {
  return new Promise(function (resolve, reject) {
    return method(...args, function (err, result) {
      return err ? reject(err) : resolve(result)
    })
  })
}

/**
 * Sanitizes an input according to SAT rules
 * Converts tabs, carriage returns and line breaks to spaces
 * Removes leading and trailing spaces
 *
 * @param {string} value - String to be sanitized
 * @return {string} Sanitized response
 */
function sanitizeInput (value = '') {
  return value.replace(/\r?\n|\r|\t|(\s)+/g, ' ').trim()
}

/**
 * Obtains the values of the cadena original del complemento as specified by SAT
 *
 * @param {string} factura - libxml Object
 * @return {Array} cadenaOriginal of complemento
 */
function getCCValues (factura = '') {
  let cadenaOriginal = []
  if (!factura) return cadenaOriginal
  const timbreFiscalDigital = factura.get('//tfd:TimbreFiscalDigital', { tfd: 'http://www.sat.gob.mx/TimbreFiscalDigital' })

  // 1. Version
  const version = (timbreFiscalDigital.attr('Version') && timbreFiscalDigital.attr('Version').value()) || ''
  if (version) cadenaOriginal.push(version)
  // 2. UUID
  const UUID = (timbreFiscalDigital.attr('UUID') && timbreFiscalDigital.attr('UUID').value()) || ''
  if (UUID) cadenaOriginal.push(UUID)
  // 3. FechaTimbrado
  const fechaTimbrado = (timbreFiscalDigital.attr('FechaTimbrado') && timbreFiscalDigital.attr('FechaTimbrado').value()) || ''
  if (fechaTimbrado) cadenaOriginal.push(fechaTimbrado)
  // 4. RfcProvCertif
  const rfcProvCertif = (timbreFiscalDigital.attr('RfcProvCertif') && timbreFiscalDigital.attr('RfcProvCertif').value()) || ''
  if (rfcProvCertif) cadenaOriginal.push(rfcProvCertif)
  // 5. Leyenda Optional
  const leyenda = (timbreFiscalDigital.attr('Leyenda') && timbreFiscalDigital.attr('Leyenda').value()) || ''
  if (leyenda) cadenaOriginal.push(leyenda)
  // 6. SelloCFD
  const selloCFD = (timbreFiscalDigital.attr('SelloCFD') && timbreFiscalDigital.attr('SelloCFD').value()) || ''
  if (selloCFD) cadenaOriginal.push(selloCFD)
  // 7. NoCertificadoSAT
  const noCertificado = (timbreFiscalDigital.attr('NoCertificadoSAT') && timbreFiscalDigital.attr('NoCertificadoSAT').value()) || ''
  if (noCertificado) cadenaOriginal.push(noCertificado)

  return cadenaOriginal.map(sanitizeInput)
}

export default {
  /**
   * Generate a Cadena Original from a given XML string
   *
   * @async
   * @param  {string}  facturaXML - The XML string of a 3.3 factura
   * @return {Promise<string>} Cadena Original string result
   */
  generaCadena: async (facturaXML) => {
    if (!facturaXML) return false
    try {
      const parsedFile = await callbackToPromise(libxslt.parseFile, cadenaPath)
      const cadena = await new Promise((resolve, reject) => {
        parsedFile.apply(facturaXML, function (err, transform) {
          return err ? reject(err) : resolve(transform)
        })
      })
      return cadena
    } catch (e) {
      return false
    }
  },
  /**
   * Generate a Cadena Original from a given XML file path
   *
   * @async
   * @param  {string}  facturaPath - Path to the .xml file
   * @return {Promise<string>} Cadena Original string result
   */
  generaCadenaFile: async (facturaPath) => {
    if (!facturaPath) return false
    try {
      fs.statSync(facturaPath)
      const parsedFile = await callbackToPromise(libxslt.parseFile, cadenaPath)
      const cadena = await new Promise((resolve, reject) => {
        parsedFile.applyToFile(facturaPath, function (err, transform) {
          return err ? reject(err) : resolve(transform)
        })
      })
      return cadena
    } catch (e) {
      return false
    }
  },
  /**
   * Generate a Cadena Original del complemento from a given XML file path
   *
   * @param  {string}  facturaXML - The XML string of a 3.3 factura
   * @return {string} Cadena Original of Complemento string result
   */
  generaCadenaOriginalCC: (facturaXML) => {
    let factura, cadenaOriginal

    factura = parseXML(facturaXML)
    if (!factura) return false
    cadenaOriginal = getCCValues(factura)

    // Validate size and that all elements contain a truthy value
    if (cadenaOriginal.length < 6 || cadenaOriginal.some((element) => !element)) {
      return false
    }

    // Build the resulting string
    return '||' + cadenaOriginal.join('|') + '||'
  }
}
