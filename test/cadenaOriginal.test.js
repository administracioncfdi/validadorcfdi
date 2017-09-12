import { expect } from 'chai'
import validador from '../src/index'
import path from 'path'
import fs from 'fs'

const cadenaOriginalResult = '||3.3|A|167ABC|2017-06-14T09:09:23|01|20001000000300022779|CONDICIONES|2269400|0.00|MXN|1|1436012.00|I|PUE|45079|01|A39DA66B-52CA-49E3-879B-5C05185B0EF7|LAHH850905BZ4|HORACIO LLANOS|608|HEPR930322977|RAFAEL ALEJANDRO HERNÁNDEZ PALACIOS|G01|01010101|00001|1.5|F52|TONELADA|ACERO|1500000|2250000|2250000|002|Tasa|0.160000|360000|2250000|003|Tasa|0.530000|1192500|51888|01010101|00002|1.6|F52|TONELADA|ALUMINIO|1500|2400|2400|002|Tasa|0.160000|384|2400|003|Tasa|0.530000|1272|15 48 3009 0001234|01010101|00003|1.7|F52|TONELADA|ZAMAC|10000|17000|17000|002|Tasa|0.160000|2720|17000|002|Tasa|0.160000|2720|01010101|055155|1.0|UNIDAD|PARTE EJEMPLO|1.00|1.00|15 48 3009 0002777|002|2720|003|1193772|1196492|002|Tasa|0.160000|363104|363104||'
const facturaPath = path.join('test', 'ejemploCFDIv33.xml')
const xmlString = fs.readFileSync(facturaPath, 'utf8')

describe('generaCadena', () => {
  it('should generate a correct cadena', async () => {
    const cadena = await validador.cadenaOriginal.generaCadena(xmlString)
    expect(cadena).to.equal(cadenaOriginalResult)
  })
  it('should return false when no XML path is sent', async () => {
    const cadena = await validador.cadenaOriginal.generaCadena()
    expect(cadena).to.equal(false)
  })
  it('should return false when invalid XML is sent', async () => {
    const cadena = await validador.cadenaOriginal.generaCadena('something wrong')
    expect(cadena).to.equal(false)
  })
})

describe('generaCadenaFile', () => {
  it('should generate a correct cadena', async () => {
    const cadena = await validador.cadenaOriginal.generaCadenaFile(facturaPath)
    expect(cadena).to.equal(cadenaOriginalResult)
  })
  it('should return false when no file is sent', async () => {
    const cadena = await validador.cadenaOriginal.generaCadenaFile()
    expect(cadena).to.equal(false)
  })
  it('should return false when invalid file is sent', async () => {
    const cadena = await validador.cadenaOriginal.generaCadenaFile('invalid')
    expect(cadena).to.equal(false)
  })
})
