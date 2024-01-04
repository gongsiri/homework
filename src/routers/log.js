const router = require("express").Router()
const connectMongoDB = require("../../database/connect/mongodb")
const isAdmin = require("../middleware/isAdmin")

//로그 목록 가져오는 api (여기에 모든 기능)
router.get('/all', isAdmin, async (req, res, next) => { // 관리자 권한만
    const { userId, order, api, dateStart, dateEnd } = req.query
    const result = {} // 결과값
    const query = {} // 조건
    const pattern = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z$/

    if (userId) {
        query['userId'] = userId
    }
    if (api) {
        query['apiName'] = api
    }
    if (dateStart && pattern.test(dateStart)) {
        if (dateEnd && pattern.test(dateEnd)) { // 시작과 끝이 모두 있는 경우
            query['time'] = { '$gte': new Date(dateStart), '$lte': new Date(dateEnd) }
        } else { // 시작만 있는 경우
            query['time'] = { '$gte': new Date(dateStart) }
        }
    } else if (dateEnd && pattern.test(dateEnd)) { // 끝만 있는 경우
        query['time'] = { '$lte': new Date(dateEnd) }
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
