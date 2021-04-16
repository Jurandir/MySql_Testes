const {sqlQueryDB}  = require('../connections/MySQL')
const getOrdenacao  = require('../helpers/getOrdenacao')
const sendLog       = require('../helpers/sendLog')

const insert_ALB = async (cartaFrete,arquivo,filial,operacao,descricao,usuario) => {
    let s_sql = "INSERT INTO ALB ( FK_EMP_ORDEM, ARQUIVO, FILIAL, FKOPERACAO, DESCRICAO, ORDENACAO, VALIDA, VALIDADOR, DATAVALIDACAO )"
        s_sql = s_sql + "VALUES (?,?,?,?,?,?,'P',?,SYSDATE())"

    let seq =  await getOrdenacao(arquivo)   

    let retorno = {
        success: false,
        message: 'Inclusão não realizada !!!',
        seq: seq,
        data: []
    }

    await sqlQueryDB(s_sql, [cartaFrete,arquivo,filial,operacao,descricao,seq,usuario]).then((rows)=>{

        // debug
        // console.log('(insert_ALB) rows:',rows)

        let { affectedRows, insertId } = rows
        
        retorno.success = (affectedRows > 0)
        retorno.message = (retorno.success==true ? 'Incluido. OK.' : retorno.message)
        if(retorno.success) {
            retorno.insertId = insertId
            sendLog('AVISO',`(020) Registro incluido com sucesso ALB : ID:(${insertId}) >> (${JSON.stringify(rows)})`)
        }

    }).catch((err)=>{
        retorno.data    = [{err: err}]
        retorno.message = 'DB Erro'
        sendLog('ERRO',`(021) MySQL - Incluido registro ALB : Erro: >> (${JSON.stringify(err)})`)
    })
        
    return retorno
}

module.exports = insert_ALB

