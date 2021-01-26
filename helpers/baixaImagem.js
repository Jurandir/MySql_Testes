const download = require('image-downloader')

require('dotenv').config()

const url_imagens = process.env.URL_IMAGENS

const baixaImagem = async ( fileName ) => {
    let retorno = {
        success: false,
        message: 'Erro obtendo arquivo !!!',
        url: `${url_imagens}/${fileName}`,
        dest: './downloads' 
    }

    const options = {
        url: retorno.url,
        dest: retorno.dest 
    }

    await download.image(options).then( ({ filename }) => {
        retorno.success = true
        retorno.message = `Arquivo "${fileName}" obtido com sucesso !!!`
    }).catch((err) => {
        retorno.message = err
    })

    return retorno
}

module.exports = baixaImagem