const getOrdenacao = async (fileName) => {
   let posImg = `${fileName}`.search('_img_')
   let posExt = `${fileName}`.search('.jpg')
   let valor  = Number.parseInt( '0'+`${fileName}`.substring(posImg+5,posExt) )

   return valor
}

module.exports = getOrdenacao