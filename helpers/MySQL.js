// get the client
const mysql = require('mysql2/promise');
const config = require("../config/dbSCCD.json")

async function main() {
    // create the connection
    const connection = await mysql.createConnection(config);

    //query database
    const [rows, fields] = await connection.execute('SELECT * FROM `usu` WHERE `login` = ? ', ['jurandir.junior']);

    console.log('=================================== fields ===')  
    //console.log(fields)  
    console.log(rows)  

    connection.end()

  }

  main()


