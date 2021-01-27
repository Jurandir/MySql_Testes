const CriaDirSCCD = require('./helpers/CriaDirSCCD')
const loadAPI = require('./helpers/loadAPI')
const baixaImagem = require('./helpers/baixaImagem')
const getUsuarioSCCD = require('./controllers/getUsuarioSCCD')
const proximoArquivo = require('./helpers/proximoArquivo')
const copiarArquivo = require('./helpers/copiarArquivo')
const excluirArquivo = require('./helpers/excluirArquivo')
const {connectDB,desconnectDB,sqlQueryDB}  = require('./connections/MySQL')


require('dotenv').config()

const api_list_sccd = process.env.API_LIST_SCCD


// baixa em API o SCCD (gravar "Data")
// insere dados no MySql (SCCD)
// conta 2 minutos e recomeça processo


//(1) - ler SCCD disponiveis na API (Pegar lista criada pelo APP)
function StartListaSCCD() {
    loadAPI('GET','',api_list_sccd,{}).then((ret)=>{
        lista_SCCD(ret)
    })
}

// (1.1) percorrer a lista
function lista_SCCD({data}) {
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
        console.log('VER ARQUIVO:',ret)
    })        
}

// (3) pega filial do usuario da APP
function pegarFilialUsuarioAPP(element) {
    let newElemento = element
    let user = newElemento.USUARIO
    if(!user){
        console.log('elemant:',element)
        return
    }
    getUsuarioSCCD(user).then( async (dados)=>{
        let newElemento = element
        if(dados.success==true){
            newElemento.FILIAL_APP = dados.data.FILIAL
            
            if(!newElemento.FILIAL_APP) {
                console.log('ERRO - PONTO 1')
                process.exit(0)
            }
            criarDiretorios(newElemento)
        } else {
          console.log('ERRO : VER USUÁRIO:',dados)
        }  
    })
}

// (4) cria diretorios relacionados
function criarDiretorios(element) {
    let newElemento = {}    
    let tipo       = element.TIPO

    
    if(tipo!=='CARTAFRETE') {
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
    console.log('POS 1 - CriaDirSCCD')
    let ret = CriaDirSCCD(par)
    if(ret.success) {
        newElemento = element
        newElemento.DIR_DESTINO = ret.diretorio
        newElemento.CARTAFRETE  = cartaFrete
        console.log('POS 2')
        copiarImagem(newElemento)
        console.log('POS 3',newElemento)
    } else {
        console.log('ERRO:',ret)
    }
}

// (5) copia imagens relacionadas para os diretorios / renomeando
async function copiarImagem(element) {
    let mask        =  `${element.CARTAFRETE}_${element.FILIAL}`
    let origem      =  `./downloads/${element.ARQUIVO}`
    let dir_destino =  element.DIR_DESTINO
    let newFile     =  await proximoArquivo(dir_destino,mask)
    let destino     =  `${dir_destino}/${newFile}`
    
    let copia = await copiarArquivo(origem,destino)
    console.log('COPIA IMAGEM resultado:',copia)

    let exclusao = await excluirArquivo(origem)
    console.log('EXCLUSÃO IMAGEM ORIGEM resultado:',exclusao)

}



// start Processo
    connectDB().then( async ()=>{
        StartListaSCCD()
    })
