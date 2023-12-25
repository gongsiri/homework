const mysql = require("mysql2/promise")
const mariaOption = {
    host: "localhost",
    port: 3306,
    user: "gongsil",
    password: "1005",
    database: "week06"
}
const connectMysql = async () => {
    const connect = await mysql.createConnection(mariaOption)
    return connect
}

const query = async (sql, params) => {
    let connect
    try {
        connect = await connectMysql()
        const result = await connect.execute(sql, params)
        return result[0]
    } finally {
        if (connect) {
            connect.end()
        }
    }
}

module.exports.connectMysql = connectMysql
module.exports.query = query


