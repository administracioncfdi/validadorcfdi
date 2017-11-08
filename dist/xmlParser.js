'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _libxmljs = require('libxmljs');

var _libxmljs2 = _interopRequireDefault(_libxmljs);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = {
  /**
   * Parses an XML string to a libxml object
   *
   * @param {string} facturaXML - String with the factura
   * @return {object} libxml object
   */
  parseXML: function parseXML() {
    var facturaXML = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';

    if (!facturaXML) return false;
    var factura = void 0;
    try {
      factura = _libxmljs2.default.parseXml(facturaXML);
    } catch (e) {
      return false;
    }
    return factura;
  }
};