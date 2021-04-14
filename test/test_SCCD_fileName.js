const loadAPI = require('../helpers/loadAPI')

require('dotenv').config({path: '../.env'})

const api_sccd_filename = process.env.API_SCCD_FILENAME
const dir_destino       = process.env.DIR_BASE || 'C:/wamp64/www/sicnovo/carga/upload'

let destino
let id = 11780

;
(async () => {
    let ret = await loadAPI('GET','',api_sccd_filename,{par_id: id})
    console.log('RET API:',ret)
    let fileName = `${ret.data.FILENAME}.jpg`
    
    destino = `${dir_destino}/${fileName}`

    console.log('FILE:',destino)

})()

