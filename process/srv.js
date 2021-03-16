const { exec } = require("child_process");
var net = require('net');

var server = net.createServer(function(socket) {
    
    socket.on('error', function(err) {
        let erro = `(SERVER ) error: ${err}`
        console.log('err:',erro)
        socket.write(erro)
     })

     socket.on('data', function(dat) {
        let commandData = dat.toString()
        console.log('>>',commandData)
        commando(commandData).then( (k)=> {
           socket.write(`${k}\r\n`);
        })
     })
    socket.pipe(socket);
});

const commando = (comm) => new Promise( (resolve,reject) => {
    exec(comm, (error, stdout, stderr) => {
        if (error) {
            reject(`error: ${error.message}`);
        }
        if (stderr) {
            reject(`stderr: ${stderr}`);
        }
        resolve( `${stdout}`  )
    });
})

server.listen(1337, '127.0.0.1');
