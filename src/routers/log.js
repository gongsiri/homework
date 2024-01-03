const router = require("express").Router()
const connectMongoDB = require("../../database/connect/mongodb")
const adminAuth = require("../middleware/adminAuth")

//로그 목록 가져오는 api (여기에 모든 기능)
router.get('/all', adminAuth, async (req, res, next) => {
    const { userId, order, api, dateStart, dateEnd, timeStart, timeEnd } = req.query
    const result = {}
    const query = {} // 조건
    if (userId) {
        query['userId'] = userId
    }
    if (api) {
        query['apiName'] = api
    }
    if (dateStart && dateEnd) {
        const dateStartQuery = new Date(`${dateStart}T00:00:00`)
        const dateEndQuery = new Date(`${dateEnd}T00:00:00`)
        query['day'] = { '$gte': dateStartQuery, '$lte': dateEndQuery }
    }
    if (timeStart && timeEnd) {
        const timeStartQuery = new Date(`${timeStart}T00:00:00`)
        const timeEndQuery = new Date(`${timeEnd}T00:00:00`)
        query['time'] = { '$gte': timeStartQuery, '$lte': timeEndQuery }
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
    }
    res.status(200).send(result)
})

module.exports = router

// alter table user_th add column is_admin boolean NOT NULL default false
//관리자 유무 넣어줌