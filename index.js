const CriaDirSCCD = require('./helpers/CriaDirSCCD')
const loadAPI = require('./helpers/loadAPI')
const baixaImagem = require('./helpers/baixaImagem')
getUsuarioSCCD = require('./controllers/getUsuarioSCCD')
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
        baixarFoto(element)
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
            
            console.log('***** : VER USUÁRIO:',dados)

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
    console.log('criarDiretorios (ENTRADA):',element)
    
    let tipo       = element.TIPO
    
    if(tipo!=='CARTAFRETE') {
        return 0
    }

    let cartaFrete = element.DOCUMENTO
    let operacao   = element.OPERACAO
    let filial_app = element.FILIAL_APP
    
    let par  = {
        cartaFrete: cartaFrete,
        operacao: operacao,
        filial: filial_app
    }    
    let ret = CriaDirSCCD(par)
    console.log('CRIAÇÃO DIRETORIO:',par)
}

// (5) copia imagens relacionadas para os diretorios / renomeando
function copiarImagem(element) {
    
}



// start Processo
    connectDB().then( async ()=>{
        StartListaSCCD()
    })
