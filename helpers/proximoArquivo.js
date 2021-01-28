const readdir = require('./readdir')

const proximoArquivo = async (dir,mask) => {
   let count = 0
   let files = await readdir(dir)
   let lenMask = `${mask}`.length
   let retorno  = {}

   for await (let file of files) {
      let maskFile = `${file}`.substr(0,lenMask)
      if(mask===maskFile){      
         let posImg = `${file}`.search('_img_')
         let posExt = `${file}`.search('.jpg')
         let valor  = Number.parseInt( '0'+`${file}`.substring(posImg+5,posExt) )
         if(valor>count) {count=valor}
      }
   }
   retorno.fileName = `${mask}_img_${count+1}.jpg`
   retorno.fullName = `${dir}/${retorno.fileName}`

   return retorno
}

module.exports = proximoArquivo
