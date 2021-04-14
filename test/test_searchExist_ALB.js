const MySQL = require('../connections/MySQL')
const searchExist_ALB =  require('../consultas/searchExist_ALB')
const searchExist_ANX =  require('../consultas/searchExist_ANX')

let cartaFrete = 'FOR18627'
let arquivo    = 'FOR18627_FOR_img_1.jpg'
let filial     = 'FOR'
let operacao   = 'VAZIO'
let tipo       = 'COMPLEMANTAR'

MySQL.connectDB().then(conn=> {

    searchExist_ALB(cartaFrete,arquivo,filial,operacao).then( (ret) => {    
        console.log('ALB:',ret)
    })

    searchExist_ANX(cartaFrete,filial,operacao,tipo).then( (ret)=>{    
        console.log('ANX:',ret)
    })
    
})


