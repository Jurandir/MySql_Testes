const fs = require('fs');

const dirBase = process.env.DIR_BASE || 'D:/New/temp'

const CriaDirSCCD = (param) => {

    let dir = []
    let cartaFrete  = `${param.cartaFrete}`.substr(0,3)+`${param.cartaFrete}`.substr(4)
    let origem      = `${cartaFrete}`.substr(0,3)  
    let operacao    = param.operacao
    let filial      = param.filial

    dir.push( dirBase+'/'+origem )
    dir.push( dirBase+'/'+origem+'/'+cartaFrete )
    dir.push( dirBase+'/'+origem+'/'+cartaFrete+'/'+operacao )
    dir.push( dirBase+'/'+origem+'/'+cartaFrete+'/'+operacao+'/'+filial )

    function criaDir(i) {
        let idx = i
        let msg = 'Sucesso. OK.'
        if (!fs.existsSync(dir[idx])){
            fs.mkdir(dir[idx], (err) => {
                if (err) {
                    return {success: false, message: err }
                }
            })
        }
        idx++
        if( dir[idx] ) {
            msg = criaDir(idx).message
        }
        return {success: true, message: msg, diretorio: dir[ dir.length-1 ]  }
    }

    let msg = criaDir(0)
    return msg
}

module.exports = CriaDirSCCD


//    == USO ==
// let par  = {
//     cartaFrete: 'SPO99999',
//     operacao: 'DESCARGA',
//     filial: 'FOR'
// }    
// let ret = CriaDirSCCD(par)
//
// console.log(ret)




