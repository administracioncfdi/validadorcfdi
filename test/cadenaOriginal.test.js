import { expect } from 'chai'
import { cadenaOriginal } from '../dist/index'
import path from 'path'
import fs from 'fs'

const cadenaOriginalResult = '||3.3|A|167ABC|2017-06-14T09:09:23|01|20001000000300022779|CONDICIONES|2269400|0.00|MXN|1|1436012.00|I|PUE|45079|01|A39DA66B-52CA-49E3-879B-5C05185B0EF7|LAHH850905BZ4|HORACIO LLANOS|608|HEPR930322977|RAFAEL ALEJANDRO HERNÁNDEZ PALACIOS|G01|01010101|00001|1.5|F52|TONELADA|ACERO|1500000|2250000|2250000|002|Tasa|0.160000|360000|2250000|003|Tasa|0.530000|1192500|51888|01010101|00002|1.6|F52|TONELADA|ALUMINIO|1500|2400|2400|002|Tasa|0.160000|384|2400|003|Tasa|0.530000|1272|15 48 3009 0001234|01010101|00003|1.7|F52|TONELADA|ZAMAC|10000|17000|17000|002|Tasa|0.160000|2720|17000|002|Tasa|0.160000|2720|01010101|055155|1.0|UNIDAD|PARTE EJEMPLO|1.00|1.00|15 48 3009 0002777|002|2720|003|1193772|1196492|002|Tasa|0.160000|363104|363104||'
const cadenaOriginalCCResult = '||1.1|5E9C4656-3365-495A-B2BB-112AE42A838C|2017-06-15T18:28:31|SFE0807172W7|RMQt7XrXKT22G1xgvz6tGq+5dXElTRTcP7KS4V+D4U2tDK5n3i5WP7zehfG9kh9FhpnVfAY8zv49VD/GcKufwBshIgIRiL9ILwoz0VYL51hh3V7K9cC/aILhapQxqo9AgHDioRYMmVvZXzR7y/4+c8sjCN1fEvfdFWP3+CQv5O1ZEWyjk4UuPj70T65uJFAIkOep5p8XS9ODJhIyWFxJvQDZTbES6qy5Q6aCGwRPy1QsCuxH75r8sz9pfTtlxdza3EFucpGCpDz2fTZto4vGkbBPOB2pgXz3HpqzACQcW1dxhxBpmCw1DL1k5ju59goImZFCxZifsiGp3iRYd5irig==|20001000000300022779||'
const facturaPath = path.join('test', 'ejemploCFDIv33.xml')
const xmlString = fs.readFileSync(facturaPath, 'utf8')

describe('generaCadena', () => {
  it('should generate a correct cadena', async () => {
    const cadena = await cadenaOriginal.generaCadena(xmlString)
    expect(cadena).to.equal(cadenaOriginalResult)
  })
  it('should return false when no XML path is sent', async () => {
    const cadena = await cadenaOriginal.generaCadena()
    expect(cadena).to.equal(false)
  })
  it('should return false when invalid XML is sent', async () => {
    const cadena = await cadenaOriginal.generaCadena('something wrong')
    expect(cadena).to.equal(false)
  })
})

describe('generaCadenaFile', () => {
  it('should generate a correct cadena', async () => {
    const cadena = await cadenaOriginal.generaCadenaFile(facturaPath)
    expect(cadena).to.equal(cadenaOriginalResult)
  })
  it('should return false when no file is sent', async () => {
    const cadena = await cadenaOriginal.generaCadenaFile()
    expect(cadena).to.equal(false)
  })
  it('should return false when invalid file is sent', async () => {
    const cadena = await cadenaOriginal.generaCadenaFile('invalid')
    expect(cadena).to.equal(false)
  })
})

describe('generaCadenaOriginalCC', () => {
  it('should generate a correct cadena', () => {
    const cadena = cadenaOriginal.generaCadenaOriginalCC(xmlString)
    expect(cadena).to.equal(cadenaOriginalCCResult)
  })
  it('should return false when no XML path is sent', () => {
    const cadena = cadenaOriginal.generaCadenaOriginalCC()
    expect(cadena).to.equal(false)
  })
  it('should return false when invalid XML is sent', () => {
    const cadena = cadenaOriginal.generaCadenaOriginalCC('something wrong')
    expect(cadena).to.equal(false)
  })
})
