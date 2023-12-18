'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.downloadCertificate = downloadCertificate;
exports.downloadCertificateById = downloadCertificateById;

var _nodeFetch = require('node-fetch');

var _nodeFetch2 = _interopRequireDefault(_nodeFetch);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Performs a fetch operation to download content from the specified URL.
 * Used to properly mock tests
 *
 * @param {string} url - The URL to fetch content from.
 * @returns {Promise<Buffer>} A Promise that resolves with the content buffer if the fetch is successful.
 * @throws {Error} If the fetch operation fails or the response status is not OK.
 */
async function performFetch(url) {
  var response = await (0, _nodeFetch2.default)(url);
  if (!response.ok) {
    throw new Error('Failed to download certificate file. Status: ' + response.status);
  }

  var fileContent = await response.buffer();
  return fileContent;
}

/**
 * Downloads a certificate file from the specified URL.
 *
 * @param {string} url - The URL of the certificate file to download.
 * @returns {Promise<Buffer>} A Promise that resolves with the certificate file content as a Buffer.
 * @throws {Error} If the download fails or the response status is not OK.
 */
async function downloadCertificate(url) {
  var fetchImplementation = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : performFetch;

  try {
    var fileContent = await fetchImplementation(url);
    return fileContent;
  } catch (error) {
    throw new Error(error);
  }
}

/**
 * Checks if a CER (Certificate) number is valid.
 *
 * @param {string} id - The CER number to validate.
 * @returns {boolean} true if the CER number is valid, false otherwise.
 */
function validateCERNumber(id) {
  return (/^[0-9]{20}$/.test(id)
  );
}

/**
 * Generates a URL for a certificate based on the provided ID.
 *
 * @param {string} id - The ID used to generate the certificate URL.
 * @returns {string} The generated certificate URL.
 */
function certificadoURL(id) {
  return 'https://rdc.sat.gob.mx/rccf/' + id.substring(0, 6) + '/' + id.substring(6, 12) + '/' + id.substring(12, 14) + '/' + id.substring(14, 16) + '/' + id.substring(16, 18) + '/' + id + '.cer';
}

/**
 * Downloads a certificate file based on the provided ID.
 *
 * @param {string} id - The ID used to generate the certificate URL.
 * @param {function} downloader - The function responsible for downloading the certificate.
 * @returns {Promise<Buffer|boolean>} A Promise that resolves with the certificate file content as a Buffer if the CER number is valid, or false if the CER number is invalid.
 */
async function downloadCertificateById(id) {
  var downloader = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : downloadCertificate;

  if (!validateCERNumber(id)) {
    return false;
  }

  var certificateUrl = certificadoURL(id);
  return downloader(certificateUrl);
}