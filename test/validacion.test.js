import { expect } from 'chai'
import validador from '../src/index'
import path from 'path'
import fs from 'fs'

const facturaPath = path.join('test', 'ejemploCFDIv33.xml')
const certificadoSATPath = path.join('test', 'certificado.cer')
const xmlString = fs.readFileSync(facturaPath, 'utf8')
const xmlStringIncomplete = '<?xml version="1.0" encoding="UTF-8"?><whatever doesntmatter="yes"></whatever>'
const xmlStringNoTimbre = '<?xml version="1.0" encoding="UTF-8"?><cfdi:Comprobante xmlns:cfdi="http://www.sat.gob.mx/cfd/3" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://www.sat.gob.mx/cfd/3 http://www.sat.gob.mx/sitio_internet/cfd/3/cfdv33.xsd" Version="3.3" Serie="A" Folio="167ABC" Fecha="2017-06-14T09:09:23"></cfdi:Comprobante>'
const xmlStringNoAttributes = '<?xml version="1.0" encoding="UTF-8"?><cfdi:Comprobante xmlns:cfdi="http://www.sat.gob.mx/cfd/3" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://www.sat.gob.mx/cfd/3 http://www.sat.gob.mx/sitio_internet/cfd/3/cfdv33.xsd" Version="3.3" Serie="A" Folio="167ABC" Fecha="2017-06-14T09:09:23"><tfd:TimbreFiscalDigital xmlns:tfd="http://www.sat.gob.mx/TimbreFiscalDigital" xsi:schemaLocation="http://www.sat.gob.mx/TimbreFiscalDigital http://www.sat.gob.mx/sitio_internet/cfd/TimbreFiscalDigital/TimbreFiscalDigitalv11.xsd" Version="1.1"/></cfdi:Comprobante>'
const certificadoSAT = fs.readFileSync(certificadoSATPath, 'binary')
const certificadoEmisor = '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'
const selloCFD = 'RMQt7XrXKT22G1xgvz6tGq+5dXElTRTcP7KS4V+D4U2tDK5n3i5WP7zehfG9kh9FhpnVfAY8zv49VD/GcKufwBshIgIRiL9ILwoz0VYL51hh3V7K9cC/aILhapQxqo9AgHDioRYMmVvZXzR7y/4+c8sjCN1fEvfdFWP3+CQv5O1ZEWyjk4UuPj70T65uJFAIkOep5p8XS9ODJhIyWFxJvQDZTbES6qy5Q6aCGwRPy1QsCuxH75r8sz9pfTtlxdza3EFucpGCpDz2fTZto4vGkbBPOB2pgXz3HpqzACQcW1dxhxBpmCw1DL1k5ju59goImZFCxZifsiGp3iRYd5irig=='
const selloSAT = 'fxec83Jf8scyyXPo3b1YQBD3vnIvRHejHHJGCoPMSljnFOFzbIcvvbYQBEQ2Bvsxt9PrEkMLtcS5RloMzq/lZZa5Hzpbt+keaiXtvMWOAiUznkK3oR5P4JYSzhBBXn1Jnwpc5r7sTbH+7S1/dQ4dTz/s2bBJ+OFP1mE3c5IGIVv9o4hgZPvkWcVP+ap1mHSVERSv/RDsYSm9jQXVoppIWqbYUhA3DeLdD7JpaUizCt0U+5Q1A/3KykwjPFdLVNzVsdF8YLN92EDYSBryTyELx/nS3oGIJ9u3d/Apz9KJmj8hTRQLs0DOSRDsrHLK8MODL/QT/yPt6LiwzOQJvqG1Zw=='

describe('validaSelloEmisor', () => {
  it('should return true for valid SelloEmisor', async () => {
    const validacion = await validador.validacion.validaSelloEmisor(xmlString, certificadoEmisor, selloCFD)
    expect(validacion).to.equal(true)
  })
  it('should return true for invalid SelloEmisor', async () => {
    const validacion = await validador.validacion.validaSelloEmisor(xmlString, certificadoEmisor, selloSAT)
    expect(validacion).to.equal(false)
  })
  it('should return false when no parameters are sent', async () => {
    const validacion = await validador.validacion.validaSelloEmisor()
    expect(validacion).to.equal(false)
  })
  it('should return false when invalid file is sent', async () => {
    const validacion = await validador.validacion.validaSelloEmisor('invalid', 'invalid', 'invalid')
    expect(validacion).to.equal(false)
  })
  it('should return false when wrong certificado is sent', async () => {
    const validacion = await validador.validacion.validaSelloEmisor(xmlString, 'invalid', selloCFD)
    expect(validacion).to.equal(false)
  })
  it('should return false when wrong sello is sent', async () => {
    const validacion = await validador.validacion.validaSelloEmisor(xmlString, certificadoEmisor, 'invalid')
    expect(validacion).to.equal(false)
  })
})

describe('validaSelloSAT', () => {
  it('should return true for valid SelloSAT', async () => {
    const validacion = await validador.validacion.validaSelloSAT(xmlString, certificadoSAT, selloSAT)
    expect(validacion).to.equal(true)
  })
  it('should return true for invalid SelloSAT', async () => {
    const validacion = await validador.validacion.validaSelloSAT(xmlString, certificadoSAT, selloCFD)
    expect(validacion).to.equal(false)
  })
  it('should return false when no parameters are sent', async () => {
    const validacion = await validador.validacion.validaSelloSAT()
    expect(validacion).to.equal(false)
  })
  it('should return false when invalid file is sent', async () => {
    const validacion = await validador.validacion.validaSelloSAT('invalid', 'invalid', 'invalid')
    expect(validacion).to.equal(false)
  })
  it('should return false when wrong certificado is sent', async () => {
    const validacion = await validador.validacion.validaSelloSAT(xmlString, 'invalid', selloSAT)
    expect(validacion).to.equal(false)
  })
  it('should return false when wrong sello is sent', async () => {
    const validacion = await validador.validacion.validaSelloSAT(xmlString, certificadoSAT, 'invalid')
    expect(validacion).to.equal(false)
  })
})

describe('validaFactura', () => {
  it('should validate a factura', async () => {
    const result = await validador.validacion.validaFactura(xmlString, certificadoSAT)
    expect(result).to.deep.include({valid: true})
  })
  it('should return error message for invalid factura', async () => {
    const result = await validador.validacion.validaFactura('', certificadoSAT)
    expect(result).to.deep.include({valid: false, message: 'Factura o certificado inexistente'})
  })
  it('should return error message when incomplete XML is sent', async () => {
    const result = await validador.validacion.validaFactura(xmlStringIncomplete, certificadoSAT)
    expect(result).to.deep.include({valid: false, message: 'Factura no contiene nodo Comprobante'})
  })
  it('should return error message when incomplete XML with no TFD is sent', async () => {
    const result = await validador.validacion.validaFactura(xmlStringNoTimbre, certificadoSAT)
    expect(result).to.deep.include({valid: false, message: 'Factura no contiene Timbre Fiscal Digital'})
  })
  it('should return error message when incomplete XML with missing attributes is sent', async () => {
    const result = await validador.validacion.validaFactura(xmlStringNoAttributes, certificadoSAT)
    expect(result).to.deep.include({valid: false, message: 'Factura no contiene certificados correctos'})
  })
  it('should return error message when invalid XML is sent', async () => {
    const result = await validador.validacion.validaFactura('something wrong', certificadoSAT)
    expect(result).to.deep.include({valid: false, message: 'Factura no pudo ser leída'})
  })
})
