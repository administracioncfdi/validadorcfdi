# Validador de CFDI Versión 3.3 y 4.0
> Librería de JavaScript que valida CFDI a partir de XML y certificado

[![npm version](https://badge.fury.io/js/validadorcfdi.svg)](https://badge.fury.io/js/validadorcfdi)
![](https://img.shields.io/npm/l/validadorcfdi.svg)
![](https://img.shields.io/npm/dt/validadorcfdi.svg)

Esta librería se encarga de leer los sellos de un XML y validarlo contra su certificado.

## Cómo comenzar

Instalar usando [`npm`](https://www.npmjs.com/):
```bash
npm install validadorcfdi --save
```
La versión de Node mínima soportada es `v12.0.0`.

## Ejemplo de uso

```js
import fs from 'fs';

const validador = require('validadorcfdi');
const factura = '<?xml version="1.0" encoding="UTF-8"?><whatever doesntmatter="yes"></whatever>';
const certificadoSAT = fs.readFileSync(certificadoSATPath, 'binary');

const resultado = await validador.validacion.validaFactura(factura, certificadoSAT);
```

En este caso `resultado` tendrá el resultado de validación en el siguiente formato:

```js
{
  "valid": true,
  "cadenaOriginal": {
    "cadena": "||3.3|CGT|...||",
    "sha": "1b9...0b0f7",
    "certificadoUsado": "000....448",
    "certificadoReportado": "000...448"
  },
  "cadenaOriginalCC": {
    "cadena": "||1.1|0448ae8f...91381||",
    "sha": "a243...5006aa",
    "certificadoUsado": "000...381",
    "certificadoReportado": "000...381"
  },
  "version": "3.3",
  "certificadoEmisor": "...",
  "UUID": "XXXXX-XXXX-XXXX-XXXX-XXXXXXXX",
  "selloCFD": "Z6l...1tA==",
  "selloSAT": "Rtc...axU=",
  "validaSelloEmisorResult": true,
  "validaSelloSATResult": true
}
```

La librería se utiliza en el [Validador CFDI 3.3](http://validadorcfdi33.herokuapp.com/)

## Meta

Mantenido por Alan Rodríguez – [@shnere](https://twitter.com/shnere) – webmaster@administracioncfdi.com

Distribuido bajo la licencia GNU General Public License v3.0. Ver ``LICENSE`` para más información.
