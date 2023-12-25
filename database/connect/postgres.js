const { Client } = require("pg")

const connectPostgres = async () => {
    const client = new Client({
        "user": "ubuntu",
        "password": "1005",
        "host": "localhost",
        "database": "week14",
        "port": 5432
    })

    await client.connect()
    return client
}

const queryModule = async (sql, params) => {
    let client
    try {
        client = await connectPostgres()
        const result = await client.query(sql, params)
        return result.rows
    } finally {
        if (client) {
            client.end()
        }
    }
}

module.exports = queryModule
