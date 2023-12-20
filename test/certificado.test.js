import { expect } from 'chai'
import sinon from 'sinon'
import * as certificado from '../dist/certificado'

describe('downloadCertificateById', () => {
  const validCertificateId = '00001000000505142236'
  const invalidCertificateId = '000010000006'

  it('should return false for an invalid CER number', async function () {
    const result = await certificado.downloadCertificateById(invalidCertificateId)
    expect(result).to.equal(false)
  })

  it('should return a Buffer for a valid CER number', async function () {
    const downloadCertificateStub = sinon.stub(certificado, 'downloadCertificate')
    downloadCertificateStub.resolves(Buffer.from('Mock Certificate'))

    const result = await certificado.downloadCertificateById(validCertificateId, downloadCertificateStub)

    expect(result).to.be.an.instanceOf(Buffer)
    expect(result.toString('utf-8')).to.equal('Mock Certificate')

    sinon.restore()
  })
})

describe('downloadCertificate', () => {
  afterEach(() => {
    sinon.restore()
  })

  it('should resolve with certificate content for a successful download', async function () {
    const URLs = {
      SAT: 'https://example.com/validcertificate.cer',
      S3: 'https://example.com/validcertificate.cer'
    }
    const performFetchStub = sinon.stub()
    performFetchStub.resolves(Buffer.from('Mock Certificate Content'))

    const result = await certificado.downloadCertificate(URLs, performFetchStub)

    expect(result).to.be.an.instanceOf(Buffer)
    expect(result.toString('utf-8')).to.equal('Mock Certificate Content')
  })

  it('should throw an error for a failed download', async function () {
    const URLs = {
      SAT: 'https://example.com/invalid.cer',
      S3: 'https://example.com/invalid.cer'
    }
    const performFetchStub = sinon.stub()
    performFetchStub.rejects(new Error('Failed to download certificate file. Status: 404'))

    try {
      const res = await certificado.downloadCertificate(URLs, performFetchStub)
      console.log('res :>> ', res)
      // The line above should throw an error, and the code below should not be reached
      expect.fail('Expected an error to be thrown')
    } catch (error) {
      expect(error.message).to.equal('Failed to download certificate file. Status: 404, Failed to download certificate file. Status: 404')
    }
  })

  it('should throw an error for a network error during download', async function () {
    const URLs = {
      SAT: 'https://example.com/nonexistent.cer',
      S3: 'https://example.com/nonexistent.cer'
    }
    const performFetchStub = sinon.stub()
    performFetchStub.rejects(new Error('Network error'))

    try {
      await certificado.downloadCertificate(URLs, performFetchStub)
      // The line above should throw an error, and the code below should not be reached
      expect.fail('Expected an error to be thrown')
    } catch (error) {
      expect(error.message).to.equal('Network error, Network error')
    }
  })
})
