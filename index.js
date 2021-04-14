const fs = require('fs')
const CriaDirSCCD = require('./helpers/CriaDirSCCD')
const loadAPI = require('./helpers/loadAPI')
const sendLog = require('./helpers/sendLog')
const baixaImagem = require('./helpers/baixaImagem')
const getUsuarioSCCD = require('./controllers/getUsuarioSCCD')
const proximoArquivo = require('./helpers/proximoArquivo')
const copiarArquivo = require('./helpers/copiarArquivo')
const excluirArquivo = require('./helpers/excluirArquivo')
const searchExist_ALB = require('./consultas/searchExist_ALB')
const insert_ALB = require('./consultas/insert_ALB')
const searchExist_ANX = require('./consultas/searchExist_ANX')
const insert_ANX = require('./consultas/insert_ANX')


const {connectDB,desconnectDB,sqlQueryDB}  = require('./connections/MySQL')


require('dotenv').config()

const api_list_sccd     = process.env.API_LIST_SCCD
const api_sccd_filename = process.env.API_SCCD_FILENAME
const api_baixa_sccd    = process.env.API_BAIXA_SCCD
const api_sccd_success  = process.env.API_SCCD_SUCCESS
const time_verify       = process.env.TIME_VERIFY

let check_xav = '---'

//(1) - ler SCCD disponiveis na API (Pegar lista criada pelo APP)
async function StartListaSCCD() {
    await loadAPI('GET','',api_list_sccd,{}).then((ret)=>{
        lista_SCCD(ret)
    })
    return 1
}

// (1.1) percorrer a lista
function lista_SCCD({data}) {
    let qtde = data.length
    sendLog('INFO',`(011) Retorno da API. ( ${qtde} itens )`)
    data.forEach(element => {
        let newElemento = element
        newElemento.FILIAL = `${newElemento.DOCUMENTO}`.substr(0,3)
        baixarFoto(newElemento)
    })
}

// (2) baixa imegens relacionadas
function baixarFoto(element) {
    let newElemento = element
    let file = newElemento.ARQUIVO
    baixaImagem(file).then((ret)=>{
        pegarFilialUsuarioAPP(newElemento)
        sendLog('INFO',`(004) Obtendo imagem. (${file})`)
    })        
}

// (3) pega filial do usuario da APP
function pegarFilialUsuarioAPP(element) {
    let newElemento = element
    let user = newElemento.USUARIO
    if(!user){
        sendLog('ERRO',`(001) Não achou usuário "${user}" em MySql. (${JSON.stringify(element)})`)
        return 0
    }
    getUsuarioSCCD(user).then( async (dados)=>{
        let newElemento = element
        if(dados.success==true){
            newElemento.FILIAL_APP = dados.data.FILIAL
            
            if(!newElemento.FILIAL_APP) {
                sendLog('ERRO FATAL',`(002) Não achou filial do usuário ("${user}") APP em MySql. (${JSON.stringify(element)})`)
                console.log('ERRO FATAL: (usuário sem filial):',user)
                return 0
                // process.exit(0)
            }
            criarDiretorios(newElemento)
        } else {
            sendLog('ERRO',`(003) Obtendo dados do usuário (${user}) APP em MySql. (${JSON.stringify(dados)})`)
        }  
    })
}

// (4) cria diretorios relacionados
function criarDiretorios(element) {
    let newElemento = {}    
    let tipo       = element.TIPO

    
    if(tipo!=='CARTAFRETE') {
        sendLog('AVISO',`(005) Não é CARTAFRETE. (${JSON.stringify(element)})`)
        return 0
    }

    let cartaFrete  = `${element.DOCUMENTO}`.substr(0,3)+`${element.DOCUMENTO}`.substr(4)
    let operacao    = element.OPERACAO
    let filial_app  = element.FILIAL_APP
    
    let par  = {
        cartaFrete: cartaFrete,
        operacao: operacao,
        filial: filial_app
    }    
    let ret = CriaDirSCCD(par)
    if(ret.success) {
        newElemento = element
        newElemento.DIR_DESTINO = ret.diretorio
        newElemento.CARTAFRETE  = cartaFrete
        copiarImagem(newElemento)
    } else {
        sendLog('ERRO',`(006) Criando diretorio. (${JSON.stringify(ret)})`)
    }
}


// (5) copia imagens relacionadas para os diretorios / renomeando
async function copiarImagem(element) {
    let filial_app  =  element.FILIAL_APP
    let mask        =  `${element.CARTAFRETE}_${filial_app}`
    let origem      =  `./downloads/${element.ARQUIVO}`
    let dir_destino =  element.DIR_DESTINO
    let newFile     =  await proximoArquivo(dir_destino,mask)
    let destino     =  newFile.fullName
    let id          =  element.ID

    try {
        let ret = await loadAPI('GET','',api_sccd_filename,{par_id: id})
        let fileName = `${ret.data.FILENAME}.jpg`
        let fileDestino = ret.data.DESTINO    
        destino = `${dir_destino}/${fileName}`
        
        if (fs.existsSync(destino)) {
            if(fileDestino) {
                // se destino está registrado no BD e existe fisicamente = Exclui para refazer fluxo
                await excluirArquivo(destino)
            } else {
                // se destino não está registrado no BD e existe fisicamente = Usa SO para gravar em um nome livre
                destino = newFile.fullName
            }
        } else {
            newFile.fullName = destino
            newFile.fileName = fileName
        }

    } catch(err) {
        sendLog('ERRO',`(1000) - ${err.message} -  (${JSON.stringify(err)})`)
        return 0
    }

    try {
        if (fs.existsSync(destino)) {
            sendLog('WARNING',`(012) Copia cancelada: (${origem}) => (${destino})`)
        } else {

        let copia = await copiarArquivo(origem,destino)
        sendLog('AVISO',`(007) Copia de arquivo: (${origem}) => (${destino}) >> (${JSON.stringify(copia)})`)
        
        let exclusao = await excluirArquivo(origem)
        sendLog('AVISO',`(008) Exclusão de arquivo: (${origem}) >> (${JSON.stringify(exclusao)})`)
        
        let newElemento = element
        newElemento.NEW_FILE      = newFile.fileName
        newElemento.FILE_FULLNAME = destino 
        baixaSCCD(id,destino,filial_app,newElemento)        

        }
    } catch(err) {
            sendLog('ERRO',`(013) Problemas, Copia ou Exclusão: (${origem}) => (${destino})`)
    }  

}

// (6) baixa em API o SCCD (gravar "Data" e "Destino")
function baixaSCCD(par_id,par_destino,par_filial_app,element) {
    params ={
        id: par_id,
        destino: par_destino,
        filial_app: par_filial_app
    }
    loadAPI('POST','',api_baixa_sccd,params).then((ret)=>{
        sendLog('AVISO',`(009) Registro de Baixa SCCD na API: ID:(${par_id}) >> (${JSON.stringify(ret)})`)
        testExist_ALB(element)
    })
}

// (7) insere dados no MySql (SCCD)
// --- testa se ALB já foi incluido
async function testExist_ALB(element) {
    let cartaFrete = element.CARTAFRETE
    let arquivo    = element.NEW_FILE
    let filial     = element.FILIAL_APP
    let operacao   = element.OPERACAO
    let descricao  = 'APP: '+element.OBS
    let usuario    = element.USUARIO   
    let alb

    await searchExist_ALB(cartaFrete,arquivo,filial,operacao).then( async (ret)=>{    
        if(ret.success==false){
            alb = await insert_ALB(cartaFrete,arquivo,filial,operacao,descricao,usuario)
        }
    })

    // evitar duplicidade em ANX   
    // cartaFrete,filial,operacao,tipo
    let check_anx = element.CARTAFRETE +'-'+ element.FILIAL_APP +'-'+ element.OPERACAO +'-'+ element.TIPOVEICULO
    if(check_anx===check_xav) {
        baixaAPI_sucesso(element.ID)
        return 0
    } else {
        testExist_ANX(element).then(ok=>{
            check_xav = '---'
        })
        check_xav = check_anx
    }

    return 1
}

// (7.1) insere ANX no MySql
async function testExist_ANX(element) {
    let cartaFrete = element.CARTAFRETE
    let filial     = element.FILIAL_APP
    let operacao   = element.OPERACAO
    let tipo       = element.TIPOVEICULO
    let usuario    = element.USUARIO   
    let anx

    await searchExist_ANX(cartaFrete,filial,operacao,tipo).then( async (ret)=>{
        if(ret.success==false){
            anx = await insert_ANX(cartaFrete,filial,operacao,usuario,tipo)
        }
    })
    baixaAPI_sucesso(element.ID)
}

// (7.2) update FLAG em API
async function baixaAPI_sucesso(par_id) {
    params ={
        id: par_id,
    }
    loadAPI('POST','',api_sccd_success,params).then((ret)=>{
        if(ret.success) {
            sendLog('SUCESSO',`(049) Processo concluido na API: ID:(${par_id})`)
        } else {
            sendLog('WARNING',`(050) Processo pendente na API: ID:(${par_id}) >> (${JSON.stringify(ret)})`)
            console.log('baixaAPI_sucesso (FAIL):',ret)
        }    
    })
}


// (8) conta 2 minutos e recomeça processo
function robo_verificacao(contador) {
    StartListaSCCD().then(()=>{
        sendLog('INFO',`(010) StartListaSCCD / ${contador}`)
    })
    setTimeout(robo_verificacao, time_verify, ++contador ) 
}

// start Processo
connectDB().then( async ()=>{
    robo_verificacao(0)
    console.log('Startup Robô - SCCD - OnLine.')
})




