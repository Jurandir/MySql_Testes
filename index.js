const CriaDirSCCD = require('./helpers/CriaDirSCCD')
const loadAPI = require('./helpers/loadAPI')
const sendLog = require('./helpers/sendLog')
const baixaImagem = require('./helpers/baixaImagem')
const getUsuarioSCCD = require('./controllers/getUsuarioSCCD')
const proximoArquivo = require('./helpers/proximoArquivo')
const copiarArquivo = require('./helpers/copiarArquivo')
const excluirArquivo = require('./helpers/excluirArquivo')
const {connectDB,desconnectDB,sqlQueryDB}  = require('./connections/MySQL')


require('dotenv').config()

const api_list_sccd  = process.env.API_LIST_SCCD
const api_baixa_sccd = process.env.API_BAIXA_SCCD


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
        sendLog('WARNING',`(001) Não achou usuário em MySql. (${JSON.stringify(element)})`)
        return 0
    }
    getUsuarioSCCD(user).then( async (dados)=>{
        let newElemento = element
        if(dados.success==true){
            newElemento.FILIAL_APP = dados.data.FILIAL
            
            if(!newElemento.FILIAL_APP) {
                sendLog('ERRO FATAL',`(002) Não achou filial do usuário APP em MySql. (${JSON.stringify(element)})`)
                process.exit(0)
            }
            criarDiretorios(newElemento)
        } else {
            sendLog('ERRO',`(003) Obtendo dados do usuário APP em MySql. (${JSON.stringify(dados)})`)
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
    let destino     =  `${dir_destino}/${newFile}`
    let id          =  element.ID
    
    let copia = await copiarArquivo(origem,destino)
    sendLog('AVISO',`(007) Copia de arquivo: (${origem}) => (${destino}) >> (${JSON.stringify(copia)})`)

    let exclusao = await excluirArquivo(origem)
    sendLog('AVISO',`(008) Exclusão de arquivo: (${origem}) >> (${JSON.stringify(exclusao)})`)

    baixaSCCD(id,destino,filial_app)

}

// (6) baixa em API o SCCD (gravar "Data" e "Destino")
function baixaSCCD(par_id,par_destino,par_filial_app) {
    params ={
        id: par_id,
        destino: par_destino,
        filial_app: par_filial_app
    }
    loadAPI('POST','',api_baixa_sccd,params).then((ret)=>{
        sendLog('AVISO',`(009) Registro de Baixa SCCD na API: ID:(${par_id}) >> (${JSON.stringify(ret)})`)
    })
}

// (7) insere dados no MySql (SCCD)
// --- testa se ALB já foi incluido
// --- se não foi pega dados na API
// --- insere no MySql

// (7.1) insere ANX no MySql
// --- update FLAG em API

// (8) conta 2 minutos e recomeça processo


// start Processo
    connectDB().then( async ()=>{
        StartListaSCCD().then(()=>{
            sendLog('AVISO',`(010) StartListaSCCD`)
        })
        console.log('Startup BotSCCD.')
    })
