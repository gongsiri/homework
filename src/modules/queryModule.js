const connectPostgres = require("../../database/connect/postgres")

const queryModule = async (sql, params) => {
    let client
    try {
        const pool = await connectPostgres()
        client = await pool.connect()
        const result = await client.query(sql, params)
        return result.rows
    } finally {
        if (client) {
            client.release()
        }
    }
}

module.exports = queryModule