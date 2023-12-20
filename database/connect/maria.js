const mysql = require("mysql2/promise")
const mariaOption = {
    host : "localhost",
    port : 3306,
    user : "gongsil",
    password : "1005",
    database : "week06"
}
const connectMysql = async() => {
    const connect = await mysql.createConnection(mariaOption)
    connect.connect()
    return connect
}
module.exports = connectMysql


