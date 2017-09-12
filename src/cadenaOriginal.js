import libxslt from 'libxslt'
import path from 'path'
import fs from 'fs'
const cadenaPath = path.join('src', 'xslt', 'cadenaoriginal_3_3.xslt')

function callbackToPromise (method, ...args) {
  return new Promise(function (resolve, reject) {
    return method(...args, function (err, result) {
      return err ? reject(err) : resolve(result)
    })
  })
}

export default {
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
