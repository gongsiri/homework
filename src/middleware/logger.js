const connectMongoDB = require("../../database/connect/mongodb")

const logger = async (req, res, status, result, next) => {
    const logData = {
        ip: req.ip,
        userId: req.session.userId,
        apiName: req.originalUrl,
        restMethod: req.method,
        inputData: req.body,
        output: result,
        time: new Date()
    }
    try {
        const db = await connectMongoDB()

        const logCollection = db.collection("logs")
        await logCollection.insertOne(logData)
    }
    catch (error) {
        console.log(error)
    }
}

module.exports = logger