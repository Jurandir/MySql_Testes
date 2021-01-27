const fs = require('fs');

const copiarArquivo = (origem,destino) => new Promise((resolve, reject) => {
  fs.copyFile(origem,destino, (err) => {
      let retorno = {
        success: false,
        message: '',
        origem: origem,
        destino: destino
      }
      if(err) {
        retorno.message = err
        reject(retorno)
      } else {
        retorno.success = true
        retorno.message = 'Copia. OK.'
        resolve(retorno)
      }
  })
})

module.exports = copiarArquivo