const {sqlQueryDB}  = require('../connections/MySQL')
const getOrdenacao  = require('../helpers/getOrdenacao')
const sendLog       = require('../helpers/sendLog')

const insert_ANX = async (par_cartafrete,par_filial,par_operacao,par_usuario,par_tipo) => {
    let emp_ordem     = `${par_cartafrete}`.substr(0,3)
    let codigo_ordem  = Number.parseInt( `${par_cartafrete}`.substr(3,10) )
    let emp_codigo    = par_cartafrete
    let filial        = par_filial
    let operacao      = par_operacao
    let tipo          = par_tipo
    let user_operacao = par_usuario

    let s_sql = `INSERT INTO ANX ( EMP_ORDEM, CODIGO_ORDEM, EMP_CODIGO, FILIAL, DATA, OPERACAO, TIPO, DATA_OPERACAO, USER_OPERACAO )
                 SELECT * FROM ( 
                     SELECT '${emp_ordem}' A1, '${codigo_ordem}' A2, '${emp_codigo}' A3, '${filial}' A4, SYSDATE() A5, '${operacao}' A6, '${tipo}' A7, SYSDATE() A8, '${user_operacao}' A9 
                     ) AS tmp
                 WHERE NOT EXISTS (
                 SELECT ID_ORDEM FROM anx 
                 WHERE EMP_CODIGO = '${emp_codigo}' 
                   AND OPERACAO   = '${operacao}' 
                   AND FILIAL     = '${filial}'
                ) LIMIT 1
                `
    let params = []
//        emp_ordem,   
//        codigo_ordem,
//        emp_codigo,  
//        filial,      
//        operacao,    
//        tipo,        
//        user_operacao
//    ]

    let retorno = {
        success: false,
        message: '(ANX) Inclusão não realizada !!!',
        data: []
    }

    await sqlQueryDB(s_sql, params ).then((rows)=>{

        // debug
        //console.log('(insert_ANX) rows:',rows)

        let { affectedRows, insertId } = rows
        
        retorno.success = (affectedRows > 0)
        retorno.message = (retorno.success==true ? 'Incluido. OK.' : retorno.message)
        if(retorno.success) {
            retorno.insertId = insertId
            sendLog('AVISO',`(030) Registro incluido com sucesso ANX : ID:(${insertId}) >> (${JSON.stringify(rows)})`)
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
