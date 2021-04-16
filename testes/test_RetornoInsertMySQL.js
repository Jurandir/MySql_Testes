
ret =` 
ResultSetHeader {
    fieldCount: 0,
    affectedRows: 1,
    insertId: 105371,
    info: 'Records: 1  Duplicates: 0  Warnings: 1',
    serverStatus: 34,
    warningStatus: 1
  }
`


obj = JSON.parse(ret)

console.log('OBJ',obj)
