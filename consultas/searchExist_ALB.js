const {sqlQueryDB}  = require('../connections/MySQL')

const searchExist_ALB = async (cartaFrete,arquivo,filial,operacao) => {
    let s_sql = 'SELECT * FROM alb WHERE fk_emp_ordem=? AND arquivo=? AND filial=? AND fkoperacao=? '

    let retorno = {
        success: false,
        message: '(ALB) Registro não localizado !!!',
        data: []
    }

    await sqlQueryDB(s_sql, [cartaFrete,arquivo,filial,operacao]).then((rows)=>{
        retorno.success = (rows.length > 0)
        retorno.data    = (retorno.success==true ? rows[0] : [] )
        retorno.message = (retorno.success==true ? 'Sucesso. OK.' : retorno.message)
    }).catch((err)=>{
        retorno.data    = [{err: err}]
        retorno.message = 'DB Erro'
        console.log('(searchExist_ALB) ERRO:',err)
    })
        
    return retorno
}

module.exports = searchExist_ALB