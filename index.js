const CriaDirSCCD = require('./helpers/CriaDirSCCD')

require('dotenv').config()


let par  = {
    cartaFrete: 'SPO99999',
    operacao: 'DESCARGA',
    filial: 'FOR'
}    
let ret = CriaDirSCCD(par)

console.log(ret)

