import fetch from 'node-fetch'
import NodeCache from 'node-cache'

// Initialize the cache
const cache = new NodeCache()

/**
 * Performs a fetch operation to download content from the specified URL.
 * Used to properly mock tests
 *
 * @param {string} url - The URL to fetch content from.
 * @returns {Promise<Buffer>} A Promise that resolves with the content buffer if the fetch is successful.
 * @throws {Error} If the fetch operation fails or the response status is not OK.
 */
async function performFetch (url) {
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(`Failed to download certificate file. Status: ${response.status}`)
  }

  const fileContent = await response.buffer()
  return fileContent
}

/**
 * Downloads a certificate file from the specified URL.
 *
 * @param {string} url - The URL of the certificate file to download.
 * @returns {Promise<Buffer>} A Promise that resolves with the certificate file content as a Buffer.
 * @throws {Error} If the download fails or the response status is not OK.
 */
export async function downloadCertificate (url, fetchImplementation = performFetch) {
  // Check if the response is already cached
  const cachedResponse = cache.get(url)
  if (cachedResponse) {
    return cachedResponse
  }

  try {
    const fileContent = await fetchImplementation(url)

    // Cache the response for 6 months
    cache.set(url, fileContent, 15768)

    return fileContent
  } catch (error) {
    throw new Error(error)
  }
}

/**
 * Checks if a CER (Certificate) number is valid.
 *
 * @param {string} id - The CER number to validate.
 * @returns {boolean} true if the CER number is valid, false otherwise.
 */
function validateCERNumber (id) {
  return /^[0-9]{20}$/.test(id)
}

/**
 * Generates a URL for a certificate based on the provided ID.
 *
 * @param {string} id - The ID used to generate the certificate URL.
 * @returns {string} The generated certificate URL.
 */
function certificadoURL (id) {
  return `https://rdc.sat.gob.mx/rccf/${id.substring(0, 6)}/${id.substring(6, 12)}/${id.substring(12, 14)}/${id.substring(14, 16)}/${id.substring(16, 18)}/${id}.cer`
}

/**
 * Downloads a certificate file based on the provided ID.
 *
 * @param {string} id - The ID used to generate the certificate URL.
 * @param {function} downloader - The function responsible for downloading the certificate.
 * @returns {Promise<Buffer|boolean>} A Promise that resolves with the certificate file content as a Buffer if the CER number is valid, or false if the CER number is invalid.
 */
export async function downloadCertificateById (id, downloader = downloadCertificate) {
  if (!validateCERNumber(id)) {
    return false
  }

  const certificateUrl = certificadoURL(id)
  return downloader(certificateUrl)
}
