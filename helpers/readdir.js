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

module.exports = readdir