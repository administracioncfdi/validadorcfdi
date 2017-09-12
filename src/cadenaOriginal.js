import libxslt from 'libxslt'
import path from 'path'
import fs from 'fs'

const cadenaPath = path.join('src', 'xslt', 'cadenaoriginal_3_3.xslt')

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
  }
}
