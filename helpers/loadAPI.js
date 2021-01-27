const axios         = require('axios')
const sendLog       = require('./sendLog')

const loadAPI = async (method,endpoint,server,params) => {

    let retorno = {
        success : false,
        message : 'Dados não encontrados !!!',
        data: [],
        isErr: false
    }

    const config = {
        headers: { "Content-Type": 'application/json' }
    }
    let url = server + endpoint
    let ret = { data: { success: false } }

    try {       
        if (method=='POST') {
            ret = await axios.post( url, params, config )
        } else {
            ret = await axios.get( url, { params }, config )
        }   

        if(ret.data.success){
            retorno = ret.data
        } else {
            retorno.success = (ret.data.length > 0)
            retorno.data    = ret.data
            retorno.isErr   = false
            retorno.message = ( retorno.success==true ? 'Sucesso. OK.' : retorno.message )
        }

        return retorno

    } catch (err) { 
        retorno.success = false
        retorno.data    = []
        retorno.isErr   = true
        retorno.url     = url
        
        if (err.message) {
            retorno.message = err.message
        } else {
           retorno.message = err
           sendLog('ERRO', 'loadAPI: '+JSON.stringify(retorno).substr(0,250) )
        }   
        
        return retorno
    }
}

module.exports = loadAPI
