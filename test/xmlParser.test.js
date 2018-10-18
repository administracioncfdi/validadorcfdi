import { expect } from 'chai'
import { parseXML } from '../dist/xmlParser'
import path from 'path'
import fs from 'fs'

const facturaPath = path.join('test', 'ejemploCFDIv33.xml')
const xmlString = fs.readFileSync(facturaPath, 'utf8')

describe('parseXML', () => {
  it('should return a libxml object for a valid factura', async () => {
    const xmlResult = parseXML(xmlString)
    expect(xmlResult.errors.length).to.equal(0)
  })
  it('should return false when no XML string is sent', async () => {
    const xmlResult = parseXML()
    expect(xmlResult).to.equal(false)
  })
  it('should return false when some other data type is sent', async () => {
    const xmlResult = parseXML({yes: 'no'})
    expect(xmlResult).to.equal(false)
  })
  it('should return false when invalid XML is sent', async () => {
    const xmlResult = parseXML('something invalid')
    expect(xmlResult).to.equal(false)
  })
})
