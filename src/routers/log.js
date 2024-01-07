const router = require("express").Router()
const connectMongoDB = require("../../database/connect/mongodb")
const isAdmin = require("../middleware/isAdmin")

//로그 목록 가져오는 api (여기에 모든 기능)
router.get('/all', isAdmin, async (req, res, next) => { // 관리자 권한만
    const { userId, order, api, dateStart, dateEnd } = req.query
    const result = {} // 결과값
    const query = {} // 조건
    const date = {}

    if (userId) {
        query['userId'] = userId
    }
    if (api) {
        query['apiName'] = api
    }
    if (dateStart && dateEnd) {
        const startDate = new Date(dateStart)
        const endDate = new Date(dateEnd)

        if (startDate.getTime() === endDate.getTime()) {
            date['$gte'] = startDate
            date['$lt'] = new Date(endDate.getTime() + 86400000) // 24시간을 더해서 다음 날의 00:00:00까지를 포함하도록 함
        } else {
            date['$gte'] = startDate
            date['$lte'] = endDate
        }

        query['time'] = date
    }

    let sortOrder
    if (order === 'asc') {
        sortOrder = 1
    } else {
        sortOrder = -1
    }

    try {
        const db = await connectMongoDB()
        const collection = db.collection("logs")

        const logData = await collection.find(query).sort({ 'time': sortOrder }).toArray()
        result.data = logData
    } catch (error) {
        console.log(error)
        next(error)
    }
    res.status(200).send(result)
})

module.exports = router
