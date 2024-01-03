const client = require("../../database/connect/mongodb")

const mongoDbLog = async (req, res, next) => {
    try {
        const logData = {
            ip: req.ip,
            userId: req.session.userId || null,
            apiName: req.originalUrl,
            restMethod: req.method,
            inputData: req.body,
            time: new Date()
        }
    }
}