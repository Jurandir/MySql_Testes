const fs = require('fs')

const excluirArquivo = (arquivo) => new Promise((resolve, reject) => {
    fs.unlink(arquivo, function (err) {
      
        let retorno = { success: false, message: '', file: arquivo }

      if(err) {
        retorno.message = err
        reject(retorno)
      } else {
        retorno.success = true
        retorno.message = 'Exclusão. OK.'
        resolve(retorno)
      }

  })
})

module.exports = excluirArquivo