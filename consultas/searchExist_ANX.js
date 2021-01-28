const {sqlQueryDB}  = require('../connections/MySQL')

const searchExist_ANX = async (cartaFrete,filial,operacao,tipo) => {
    let s_sql = 'SELECT * FROM anx WHERE emp_codigo=? AND filial=? AND operacao=? AND tipo=?  '

    let retorno = {
        success: false,
        message: '(ANX) Registro não localizado !!!',
        data: []
    }

    await sqlQueryDB(s_sql, [cartaFrete,filial,operacao,tipo]).then((rows)=>{
        retorno.success = (rows.length > 0)
        retorno.data    = (retorno.success==true ? rows[0] : [] )
        retorno.message = (retorno.success==true ? 'Sucesso. OK.' : retorno.message)
    }).catch((err)=>{
        retorno.data    = [{err: err}]
        retorno.message = 'DB Erro'
        console.log('(searchExist_ANX) ERRO:',err)
    })
        
    return retorno
}

module.exports = searchExist_ANX