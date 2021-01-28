const {sqlQueryDB}  = require('../connections/MySQL')
const getOrdenacao  = require('../helpers/getOrdenacao')
const sendLog       = require('../helpers/sendLog')

const insert_ANX = async (par_cartafrete,par_filial,par_operacao,par_usuario,par_tipo) => {
    let s_sql = "INSERT INTO ANX ( EMP_ORDEM, CODIGO_ORDEM, EMP_CODIGO, FILIAL, DATA, OPERACAO, TIPO, DATA_OPERACAO, USER_OPERACAO )"
        s_sql = s_sql + "VALUES ( ?, ?, ?, ?, SYSDATE(), ?, ?, SYSDATE(), ? )"

    let emp_ordem     = `${par_cartafrete}`.substr(0,3)
    let codigo_ordem  = Number.parseInt( `${par_cartafrete}`.substr(3,10) )
    let emp_codigo    = par_cartafrete
    let filial        = par_filial
    let operacao      = par_operacao
    let tipo          = par_tipo
    let user_operacao = par_usuario

    let params = [
        emp_ordem,   
        codigo_ordem,
        emp_codigo,  
        filial,      
        operacao,    
        tipo,        
        user_operacao
    ]

    let retorno = {
        success: false,
        message: '(ANX) Inclusão não realizada !!!',
        data: []
    }

    await sqlQueryDB(s_sql, params ).then((rows)=>{
        
        retorno.success = (rows.affectedRows > 0)
        retorno.message = (retorno.success==true ? 'Incluido. OK.' : retorno.message)
        if(retorno.success) {
            retorno.insertId = rows.insertId
            sendLog('AVISO',`(030) Registro incluido com sucesso ANX : ID:(${rows.insertId}) >> (${JSON.stringify(rows)})`)
        }

    }).catch((err)=>{
        retorno.data    = [{err: err}]
        retorno.message = 'DB Erro'
        sendLog('ERRO',`(031) MySQL - Incluido registro ANX : Erro: >> (${JSON.stringify(err)})`)
        console.log('(insert_ANX) ERRO:',params,err)
    })
        
    return retorno
}

module.exports = insert_ANX
