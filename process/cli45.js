const net = require('net');
const readline = require("readline");
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

rl.on("close", function() {
    console.log("\nBYE BYE !!!");
    client.destroy(); // kill client after server's response
    process.exit(0);
});


var client = new net.Socket();
client.connect(1337, '192.168.0.45', function() {
	console.log('Connected');
	client.write('dir');
});

client.on('data', function(data) {
	console.log('>> ' +  `${data}\r\n`);
    rl.question("Commando: ", function(wcommando) {
        if(wcommando == 'end') { rl.close() } else { client.write(wcommando) }
    });    
});

client.on('close', function() {
	console.log('Connection closed');
});