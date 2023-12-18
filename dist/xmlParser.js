"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.parseXML = parseXML;
var _node1LibxmljsmtMyh = _interopRequireDefault(require("node1-libxmljsmt-myh"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }
/**
 * Parses an XML string to a libxml object
 *
 * @param {string} facturaXML - String with the factura
 * @return {object} libxml object
 */
function parseXML() {
  var facturaXML = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';
  if (!facturaXML) return false;
  var factura;
  try {
    factura = _node1LibxmljsmtMyh["default"].parseXml(facturaXML);
  } catch (e) {
    return false;
  }
  return factura;
}