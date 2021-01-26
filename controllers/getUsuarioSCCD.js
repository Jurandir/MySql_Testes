const {connectDB,desconnectDB,sqlQueryDB}  = require('../connections/MySQL')

require('dotenv').config()

const getUsuarioSCCD = async (user) => {
    let retorno = {
        success: false,
        message: 'Usuário não localizado !!!',
        data: []
    }
        await sqlQueryDB('SELECT * FROM `usu` WHERE `login` = ? ', [user]).then((rows)=>{
            retorno.success = (rows.length > 0)
            retorno.data    = rows[0]
            retorno.message = (retorno.success==true ? 'Sucesso. OK.' : retorno.message)
        })
        
    return retorno
}

module.exports = getUsuarioSCCD