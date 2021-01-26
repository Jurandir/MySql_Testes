const download = require('image-downloader')

const URL_IMAGENS='http://localhost:5000/sccd/uploads'

let file = '0ba750d0-1915-4b53-8ccd-231c11537c56.jpg'

const options = {
  url: URL_IMAGENS+'/'+file,
  dest: './downloads' 
}

download.image(options)
  .then(({ filename }) => {
    console.log('Saved to', filename)  // saved to /path/to/dest/image.jpg
  })
  .catch((err) => console.error(err))