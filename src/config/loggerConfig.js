const connectMongoDB = require("../../database/connect/mongodb")

const logger = async (req, res, result) => { // 로그 기록
    const logData = {
        ip: req.ip, // ip
        userId: (req.session && req.session.userId) || null, // userId
        apiName: req.originalUrl, // API이름
        restMethod: req.method, // method 방식
        inputData: req.body, // 인풋
        output: result, // 아웃풋
        time: new Date(), //시간
    }
    try {
        const db = await connectMongoDB()

        const logCollection = db.collection("logs") // log 컬렉션 가져옴
        await logCollection.insertOne(logData) // 로그 데이터를 컬렉션에 삽입
    }
    catch (error) {
        next(error)
    }
}

module.exports = logger