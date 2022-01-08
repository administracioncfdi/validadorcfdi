import libxmljs from 'node1-libxmljsmt-myh'

/**
 * Parses an XML string to a libxml object
 *
 * @param {string} facturaXML - String with the factura
 * @return {object} libxml object
 */
function parseXML (facturaXML = '') {
  if (!facturaXML) return false
  let factura
  try {
    factura = libxmljs.parseXml(facturaXML)
  } catch (e) {
    return false
  }
  return factura
}

export {
  parseXML
}
