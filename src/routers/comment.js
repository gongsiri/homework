const router = require("express").Router()
const queryModule = require("../modules/queryModule")
const isLogout = require("../middleware/isLogout")
const checkTrim = require("../middleware/checkTrim")
const sendModule = require("../modules/sendMoudle")

//댓글 쓰기
router.post("/", isLogout, checkTrim("content"), async (req, res, next) => {
    const { content, postingKey } = req.body
    const result = {
        "message": ""
    }
    try {
        const sql = 'INSERT INTO comment (account_key,posting_key,content) VALUES ($1,$2,$3)'
        await queryModule(sql, [req.session.userKey, postingKey, content])

        sendModule(req, res, 200, result)
    } catch (error) {
        next(error)
    }
})

//댓글 읽기
router.get("/", isLogout, async (req, res, next) => {
    const { postingKey } = req.body
    const sessionKey = req.session.userKey
    const result = {
        "message": "",
        "data": null
    }
    try {
        const sql = "SELECT * FROM comment WHERE posting_key=$1 ORDER BY create_at"
        const queryData = await queryModule(sql, [postingKey])

        queryData.forEach(elem => {
            if (elem.account_key != sessionKey) {
                elem.isMine = false
            } else {
                elem.isMine = true
            }
        })

        result.data = queryData
        sendModule(req, res, 200, result)
    } catch (error) {
        next(error)
    }
})

//댓글 수정
router.put("/:idx", isLogout, checkTrim("content"), async (req, res, next) => {
    const { content } = req.body
    const commentKey = req.params.idx
    const sessionKey = req.session.userKey
    const result = {
        "message": "",
        "data": null
    }
    try {
        const sql = "UPDATE comment SET content=$1 WHERE comment_key=$2 AND account_key =$3"
        await queryModule(sql, [content, commentKey, sessionKey])

        result.data = {
            "commentKey": commentKey,
            "userKey": sessionKey,
            "content": content
        }
        sendModule(req, res, 200, result)

    } catch (error) {
        next(error)
    }
})

//댓글 삭제 
router.delete("/:idx", isLogout, async (req, res, next) => {
    const commentKey = req.params.idx
    const sessionKey = req.session.userKey
    const result = {
        "message": ""
    }
    try {
        const sql = "DELETE FROM comment WHERE comment_key= $1 AND account_key =$2"
        await queryModule(sql, [commentKey, sessionKey])
        sendModule(req, res, 200, result)
    } catch (error) {
        next(error)
    }
})

module.exports = router