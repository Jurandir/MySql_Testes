const mysql = require('mysql2/promise')
const production = require("../config/dbSCCD.json")
const developer = require("../config/localhost.json")

require('dotenv').config()

const node_env = process.env.NODE_ENV
let config = developer

if(node_env==='Production'){
   config = production 
}  

console.log('*** NODE Mode:',node_env)

const MySQL = {
  connectDB: async function() {
      global.connection = await mysql.createConnection(config) 
      return 1
  },
  desconnectDB: async function()  {
      global.connection.end()
      return 0
  },
  sqlQueryDB: async function (sel,par) {
      const [rows, fields] = await global.connection.execute(sel,par)  
      return rows  
  }
}

module.exports = MySQL
 