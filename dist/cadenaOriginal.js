'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _libxslt = require('libxslt');

var _libxslt2 = _interopRequireDefault(_libxslt);

var _xmlParser = require('./xmlParser');

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var cadenaPath = _path2.default.join(__dirname, 'xslt', 'cfd', '3', 'cadenaoriginal_3_3', 'cadenaoriginal_3_3.xslt');

/**
 * Converts a callback to a promise, used for async/await
 *
 * @function
 * @param {...*} args - Arguments
 * @return {Promise} Callback converted to promise
 */
function callbackToPromise(method) {
  for (var _len = arguments.length, args = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
    args[_key - 1] = arguments[_key];
  }

  return new Promise(function (resolve, reject) {
    return method.apply(undefined, args.concat([function (err, result) {
      return err ? reject(err) : resolve(result);
    }]));
  });
}

/**
 * Sanitizes an input according to SAT rules
 * Converts tabs, carriage returns and line breaks to spaces
 * Removes leading and trailing spaces
 *
 * @param {string} value - String to be sanitized
 * @return {string} Sanitized response
 */
function sanitizeInput() {
  var value = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';

  return value.replace(/\r?\n|\r|\t|(\s)+/g, ' ').trim();
}

/**
 * Obtains the values of the cadena original del complemento as specified by SAT
 *
 * @param {string} factura - libxml Object
 * @return {Array} cadenaOriginal of complemento
 */
function getCCValues() {
  var factura = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';

  var cadenaOriginal = [];
  if (!factura) return cadenaOriginal;
  var timbreFiscalDigital = factura.get('//tfd:TimbreFiscalDigital', { tfd: 'http://www.sat.gob.mx/TimbreFiscalDigital' });

  // 1. Version
  var version = timbreFiscalDigital.attr('Version') && timbreFiscalDigital.attr('Version').value() || '';
  if (version) cadenaOriginal.push(version);
  // 2. UUID
  var UUID = timbreFiscalDigital.attr('UUID') && timbreFiscalDigital.attr('UUID').value() || '';
  if (UUID) cadenaOriginal.push(UUID);
  // 3. FechaTimbrado
  var fechaTimbrado = timbreFiscalDigital.attr('FechaTimbrado') && timbreFiscalDigital.attr('FechaTimbrado').value() || '';
  if (fechaTimbrado) cadenaOriginal.push(fechaTimbrado);
  // 4. RfcProvCertif
  var rfcProvCertif = timbreFiscalDigital.attr('RfcProvCertif') && timbreFiscalDigital.attr('RfcProvCertif').value() || '';
  if (rfcProvCertif) cadenaOriginal.push(rfcProvCertif);
  // 5. Leyenda Optional
  var leyenda = timbreFiscalDigital.attr('Leyenda') && timbreFiscalDigital.attr('Leyenda').value() || '';
  if (leyenda) cadenaOriginal.push(leyenda);
  // 6. SelloCFD
  var selloCFD = timbreFiscalDigital.attr('SelloCFD') && timbreFiscalDigital.attr('SelloCFD').value() || '';
  if (selloCFD) cadenaOriginal.push(selloCFD);
  // 7. NoCertificadoSAT
  var noCertificado = timbreFiscalDigital.attr('NoCertificadoSAT') && timbreFiscalDigital.attr('NoCertificadoSAT').value() || '';
  if (noCertificado) cadenaOriginal.push(noCertificado);

  return cadenaOriginal.map(sanitizeInput);
}

exports.default = {
  /**
   * Generate a Cadena Original from a given XML string
   *
   * @async
   * @param  {string}  facturaXML - The XML string of a 3.3 factura
   * @return {Promise<string>} Cadena Original string result
   */
  generaCadena: async function generaCadena(facturaXML) {
    if (!facturaXML) return false;
    try {
      var parsedFile = await callbackToPromise(_libxslt2.default.parseFile, cadenaPath);
      var cadena = await new Promise(function (resolve, reject) {
        parsedFile.apply(facturaXML, function (err, transform) {
          return err ? reject(err) : resolve(transform);
        });
      });
      return cadena;
    } catch (e) {
      return false;
    }
  },
  /**
   * Generate a Cadena Original from a given XML file path
   *
   * @async
   * @param  {string}  facturaPath - Path to the .xml file
   * @return {Promise<string>} Cadena Original string result
   */
  generaCadenaFile: async function generaCadenaFile(facturaPath) {
    if (!facturaPath) return false;
    try {
      _fs2.default.statSync(facturaPath);
      var parsedFile = await callbackToPromise(_libxslt2.default.parseFile, cadenaPath);
      var cadena = await new Promise(function (resolve, reject) {
        parsedFile.applyToFile(facturaPath, function (err, transform) {
          return err ? reject(err) : resolve(transform);
        });
      });
      return cadena;
    } catch (e) {
      return false;
    }
  },
  /**
   * Generate a Cadena Original del complemento from a given XML file path
   *
   * @param  {string}  facturaXML - The XML string of a 3.3 factura
   * @return {string} Cadena Original of Complemento string result
   */
  generaCadenaOriginalCC: function generaCadenaOriginalCC(facturaXML) {
    var factura = void 0,
        cadenaOriginal = void 0;

    factura = (0, _xmlParser.parseXML)(facturaXML);
    if (!factura) return false;
    cadenaOriginal = getCCValues(factura);

    // Validate size and that all elements contain a truthy value
    if (cadenaOriginal.length < 6 || cadenaOriginal.some(function (element) {
      return !element;
    })) {
      return false;
    }

    // Build the resulting string
    return '||' + cadenaOriginal.join('|') + '||';
  }
};