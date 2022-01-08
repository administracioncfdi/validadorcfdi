'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.parseXML = undefined;

var _node1LibxmljsmtMyh = require('node1-libxmljsmt-myh');

var _node1LibxmljsmtMyh2 = _interopRequireDefault(_node1LibxmljsmtMyh);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Parses an XML string to a libxml object
 *
 * @param {string} facturaXML - String with the factura
 * @return {object} libxml object
 */
function parseXML() {
  var facturaXML = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';

  if (!facturaXML) return false;
  var factura = void 0;
  try {
    factura = _node1LibxmljsmtMyh2.default.parseXml(facturaXML);
  } catch (e) {
    return false;
  }
  return factura;
}

exports.parseXML = parseXML;