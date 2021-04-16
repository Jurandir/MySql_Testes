const sqlQuery = require('../connections/sqlQuery')
const sqlExec  = require('../connections/sqlExec')
const {connectDB,sqlQueryDB}  = require('../connections/MySQL')



const documento  = `FOR-18624`



const cartaOrdem = documento.split('-').join('')

// start Processo
connectDB().then( async ()=>{
    console.log('Corrige Duplicidades - SCCD')
    console.log(documento,cartaOrdem)
    rodaAjustes()
})

function rodaAjustes() {
    sql_MySQL(cartaOrdem).then(ret=>{
        console.log('MySQL OK')
        ret.forEach(element => {
            exclui_ANX_MySQL(element)
        });
    })

    sql_mssql(documento).then(ret=>{
        console.log('msSql OK')
        ret.forEach(element => {
            exclui_ALB_MySQL(element)
        });
    })
}

async function exclui_ALB_MySQL(element) {
    let carta    = cartaOrdem
    let operacao = element.OPERACAO
    let splitStr = `/${element.OPERACAO}/${element.FILIAL_APP}/`
    let arquivo  = `${element.DESTINO}`.split(splitStr)[1]

    await sql_MySQL_ALB(carta,operacao,arquivo).then((ret)=>{
        let alb     = ret[0]
        
        if(ret.length==0) { 
            console.log('Falha sql_MySQL_ALB:',alb)
            return 0 
        }

        update_msSql(element.ID,alb).then((ret)=>{
            let id_alb  = alb.ID_IMG
            let arq     = alb.ARQUIVO
            
            if(!id_alb){ 
                console.log('ALB:',alb)
                console.log('Falha.')
                process.exit(0) 
            } 

            delete_ALB(id_alb,arq).then(ret=>{
                console.log('OK:',id_alb,arq)
            }).catch(err=>{
                console.log('ERR:',err)
            })
        })
    })

    console.log('exclui_ALB_MySQL:',cartaOrdem,operacao,arquivo,' => ',element.DESTINO)
}

async function delete_ALB(id,arquivo) {
    let sql = 'DELETE FROM ALB WHERE ID_IMG = ?'
    let data = await sqlQueryDB(sql, [id])
    console.log('delete_ALB:',cartaOrdem,id,arquivo,' => Dados Afetados:',data.affectedRows)       
}

async function exclui_ANX_MySQL(element) {
    let id_ordem = element.ID_ORDEM
    let sql = 'DELETE FROM ANX WHERE ID_ORDEM = ?'
    let data = await sqlQueryDB(sql, [id_ordem])

    console.log('exclui_ANX_MySQL:',cartaOrdem,id_ordem,' => Dados Afetados:',data.affectedRows)       
}

async function sql_MySQL (cartaOrdem) {
    sql = `
    SELECT * FROM ANX
    WHERE EMP_CODIGO='${cartaOrdem}'
    AND ID_ORDEM NOT IN (
    SELECT MIN(ID_ORDEM) 
    -- ,EMP_ORDEM,CODIGO_ORDEM,EMP_CODIGO,FILIAL,DATA,OPERACAO,TIPO,DATA_OPERACAO,USER_OPERACAO 
    FROM ANX 
    WHERE EMP_CODIGO='${cartaOrdem}'
    GROUP BY EMP_ORDEM,CODIGO_ORDEM,EMP_CODIGO,FILIAL,DATA,OPERACAO,TIPO,DATA_OPERACAO,USER_OPERACAO ) 
    `
    let data = await sqlQueryDB(sql, [])
    console.log('MySQL Dados:',data.length)       
    return data
}

async function sql_MySQL_ALB (cartaOrdem,operacao,arquivo) {
    sql = `
    SELECT * 
    FROM ALB 
    WHERE FK_EMP_ORDEM='${cartaOrdem}'
    AND FKOPERACAO = '${operacao}'
    AND ARQUIVO = '${arquivo}'
    `
    let data = await sqlQueryDB(sql, [])
    console.log('MySQL Dados:',data.length)       
    return data
}

async function sql_mssql (documento) {
    sql = `
    SELECT * FROM SCCD_APP A
    WHERE 1=1
    AND A.ID NOT IN ( SELECT MIN(B.ID) ID FROM SCCD_APP B GROUP BY B.DOCUMENTO,B.ARQUIVO,B.OPERACAO,B.IMAGEM_ID )
    AND A.DOCUMENTO = '${documento}'
    AND A.FLAG_MYSQL = 1
    ORDER BY A.ID
    `
    let data = await sqlQuery(sql)
    console.log('msSql Dados:',data.length)       
    return data
}

async function update_msSql(id,alb) {

    if(!id || !alb){ 
        console.log('Falha update_msSql:',id,alb)
        return 0        
    } 

    let dt_validacao =  alb.DATAVALIDACAO==undefined ? null : alb.DATAVALIDACAO.toISOString() 
    sql = `
    UPDATE SIC.dbo.SCCD_APP
    SET VALIDA='${alb.VALIDA}',
        VALIDADOR='${alb.VALIDADOR}',
        VALIDACAO='${dt_validacao}',
        ALB_ID=${alb.ID_IMG},
        DT_AJUSTE=CURRENT_TIMESTAMP
    WHERE ID = ${id}
    `
    let data = await sqlExec(sql)
    console.log('UPDATE Dados:',data,sql)       

    return 1
}
