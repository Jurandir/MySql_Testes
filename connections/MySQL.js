const mysql = require('mysql2/promise')
const config = require("../config/dbSCCD.json")

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
 