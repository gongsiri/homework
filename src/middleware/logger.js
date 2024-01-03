const connectMongoDB = require("../../database/connect/mongodb")

const logger = async (req, res, next) => {
    try {
        const logData = {
            ip: req.ip,
            userId: req.session.userId,
            apiName: req.originalUrl,
            restMethod: req.method,
            input: req.body,
            output: res.send(req.body),
            time: new Date()
        }
        const db = await connectMongoDB()

        const logCollection = db.collection("logs")
        await logCollection.insertOne(logData)
        next()
    } catch (error) {
        next(error)
    }
}

module.exports = logger