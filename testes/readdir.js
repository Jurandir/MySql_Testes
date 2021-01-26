// readdir.js 
const fs = require('fs');

const readdir = (dir) => new Promise((resolve, reject) => {
   fs.readdir(dir,function(error,files){
      if(error) {
         reject(error)
      } else {
         resolve(files)
      }
   })
})

const proximoArquivo = async (dir,mask) => {
   let count = 0
   let files = await readdir(dir)
   let lenMask = `${mask}`.length

   for await (let file of files) {
      let maskFile = `${file}`.substr(0,lenMask)
      if(mask===maskFile){      
         let posImg = `${file}`.search('_img_')
         let posExt = `${file}`.search('.jpg')
         let valor  = Number.parseInt( '0'+`${file}`.substring(posImg+5,posExt) )
         if(valor>count) {count=valor}
      }
   }
   return `${mask}_img_${count+1}.jpj`
}

proximoArquivo('../uploads','SAV56012_SAV').then((a)=>{
   console.log('2',a)
})
