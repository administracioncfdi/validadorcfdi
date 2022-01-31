import { expect } from 'chai'
import { validacion } from '../dist/index'
import path from 'path'
import fs from 'fs'

const factura33Path = path.join('test', 'ejemploCFDIv33.xml')
const factura40Path = path.join('test', 'ejemploCFDIv40.xml')
const certificadoSATPath = path.join('test', 'certificado.cer')
const certificadoSAT = fs.readFileSync(certificadoSATPath, 'binary')
const certificado40SATPath = path.join('test', 'certificado40.cer')
const certificado40SAT = fs.readFileSync(certificado40SATPath, 'binary')

const xmlString = fs.readFileSync(factura33Path, 'utf8')
const xmlString40 = fs.readFileSync(factura40Path, 'utf8')
const xmlStringIncomplete = '<?xml version="1.0" encoding="UTF-8"?><whatever doesntmatter="yes"></whatever>'
const xmlStringNoTimbre = '<?xml version="1.0" encoding="UTF-8"?><cfdi:Comprobante xmlns:cfdi="http://www.sat.gob.mx/cfd/3" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://www.sat.gob.mx/cfd/3 http://www.sat.gob.mx/sitio_internet/cfd/3/cfdv33.xsd" Version="3.3" Serie="A" Folio="167ABC" Fecha="2017-06-14T09:09:23"></cfdi:Comprobante>'
const xmlStringNoAttributes = '<?xml version="1.0" encoding="UTF-8"?><cfdi:Comprobante xmlns:cfdi="http://www.sat.gob.mx/cfd/3" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://www.sat.gob.mx/cfd/3 http://www.sat.gob.mx/sitio_internet/cfd/3/cfdv33.xsd" Version="3.3" Serie="A" Folio="167ABC" Fecha="2017-06-14T09:09:23"><tfd:TimbreFiscalDigital xmlns:tfd="http://www.sat.gob.mx/TimbreFiscalDigital" xsi:schemaLocation="http://www.sat.gob.mx/TimbreFiscalDigital http://www.sat.gob.mx/sitio_internet/cfd/TimbreFiscalDigital/TimbreFiscalDigitalv11.xsd" Version="1.1"/></cfdi:Comprobante>'

let certificadoEmisor
let selloCFD
let selloSAT

before(async () => {
  const factura = await validacion.readFactura(xmlString, certificadoSAT)
  selloCFD = factura.selloCFD
  selloSAT = factura.selloSAT
  certificadoEmisor = factura.certificadoEmisor
})

describe('validaSelloEmisor', () => {
  it('should return true for valid SelloEmisor', async () => {
    const resValidacion = await validacion.validaSelloEmisor(xmlString, certificadoEmisor, selloCFD)
    expect(resValidacion).to.equal(true)
  })
  it('should return true for invalid SelloEmisor', async () => {
    const resValidacion = await validacion.validaSelloEmisor(xmlString, certificadoEmisor, selloSAT)
    expect(resValidacion).to.equal(false)
  })
  it('should remove carriage returns and spaces from certificadoEmisor', async () => {
    const resValidacion = await validacion.validaSelloEmisor(xmlString, '\n' + certificadoEmisor + '  \r\n', selloCFD)
    expect(resValidacion).to.equal(true)
  })
  it('should remove carriage returns and spaces from sello', async () => {
    const resValidacion = await validacion.validaSelloEmisor(xmlString, certificadoEmisor, selloCFD.substr(0, 10) + '\n ' + selloCFD.substr(10) + '\r\n')
    expect(resValidacion).to.equal(true)
  })
  it('should return false when no parameters are sent', async () => {
    const resValidacion = await validacion.validaSelloEmisor()
    expect(resValidacion).to.equal(false)
  })
  it('should return false when invalid file is sent', async () => {
    const resValidacion = await validacion.validaSelloEmisor('invalid', 'invalid', 'invalid')
    expect(resValidacion).to.equal(false)
  })
  it('should return false when wrong certificado is sent', async () => {
    const resValidacion = await validacion.validaSelloEmisor(xmlString, 'invalid', selloCFD)
    expect(resValidacion).to.equal(false)
  })
  it('should return false when wrong sello is sent', async () => {
    const resValidacion = await validacion.validaSelloEmisor(xmlString, certificadoEmisor, 'invalid')
    expect(resValidacion).to.equal(false)
  })
})

describe('validaSelloSAT', () => {
  it('should return true for valid SelloSAT', async () => {
    const resValidacion = await validacion.validaSelloSAT(xmlString, certificadoSAT, selloSAT)
    expect(resValidacion).to.equal(true)
  })
  it('should return true for invalid SelloSAT', async () => {
    const resValidacion = await validacion.validaSelloSAT(xmlString, certificadoSAT, selloCFD)
    expect(resValidacion).to.equal(false)
  })
  it('should return false when no parameters are sent', async () => {
    const resValidacion = await validacion.validaSelloSAT()
    expect(resValidacion).to.equal(false)
  })
  it('should return false when invalid file is sent', async () => {
    const resValidacion = await validacion.validaSelloSAT('invalid', 'invalid', 'invalid')
    expect(resValidacion).to.equal(false)
  })
  it('should return false when wrong certificado is sent', async () => {
    const resValidacion = await validacion.validaSelloSAT(xmlString, 'invalid', selloSAT)
    expect(resValidacion).to.equal(false)
  })
  it('should return false when wrong sello is sent', async () => {
    const resValidacion = await validacion.validaSelloSAT(xmlString, certificadoSAT, 'invalid')
    expect(resValidacion).to.equal(false)
  })
})

describe('validaFactura 3.3', () => {
  it('should validate a factura', async () => {
    const result = await validacion.validaFactura(xmlString, certificadoSAT)
    expect(result).to.deep.include({valid: true})
  })
  it('should return error message for invalid factura', async () => {
    const result = await validacion.validaFactura('', certificadoSAT)
    expect(result).to.deep.include({valid: false, message: 'Factura o certificado inexistente'})
  })
  it('should return error message when incomplete XML is sent', async () => {
    const result = await validacion.validaFactura(xmlStringIncomplete, certificadoSAT)
    expect(result).to.deep.include({valid: false, message: 'Factura no contiene nodo Comprobante'})
  })
  it('should return error message when incomplete XML with no TFD is sent', async () => {
    const result = await validacion.validaFactura(xmlStringNoTimbre, certificadoSAT)
    expect(result).to.deep.include({valid: false, message: 'Factura no contiene Timbre Fiscal Digital'})
  })
  it('should return error message when incomplete XML with missing attributes is sent', async () => {
    const result = await validacion.validaFactura(xmlStringNoAttributes, certificadoSAT)
    expect(result).to.deep.include({valid: false, message: 'Factura no contiene certificados correctos'})
  })
  it('should return error message when invalid XML is sent', async () => {
    const result = await validacion.validaFactura('something wrong', certificadoSAT)
    expect(result).to.deep.include({valid: false, message: 'Factura no pudo ser leída'})
  })
})

describe('validaFactura 4.0', () => {
  it('should validate a factura', async () => {
    const result = await validacion.validaFactura(xmlString40, certificado40SAT)
    expect(result).to.deep.include({valid: true})
  })
})
