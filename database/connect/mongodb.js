const MongoClient = require("mongodb").MongoClient // 몽고디비 연결

async function connectMongoDB() {
    const client = new MongoClient("mongodb://localhost:27017")
    try {
        await client.connect()
        return client.db("week15")
    } catch (error) {
        throw error
    }
}

module.exports = connectMongoDB
