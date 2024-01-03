const MongoClient = require("mongodb").MongoClient

async function connectMongoDB() {
    const client = new MongoClient("mongodb://localhost:27017")
    try {
        await client.connect()
        return client.db(week15)
    } catch (error) {
        throw error
    }
}

module.exports = connectMongoDB
