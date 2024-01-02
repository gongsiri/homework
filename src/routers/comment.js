const router = require("express").Router()
const queryModule = require("../../database/connect/postgres")
const checkLogout = require("../middleware/checkLogout")
const checkTrim = require("../modules/checkTrim")
const checkKey = require("../modules/checkKey")

//댓글 쓰기
router.post("/", checkLogout, async (req, res, next) => {
    const { content, postingKey } = req.body
    const result = {
        "message": "",
        "data": null
    }
    try {
        checkKey(postingKey, "게시물")
        checkTrim(content, "내용")

        const sql = 'INSERT INTO comment (account_key,posting_key,content) VALUES ($1,$2,$3)'
        await queryModule(sql, [req.session.userKey, postingKey, content])

        result.message = "댓글 쓰기 성공"
        result.data = { // 굳이
            "postingKey": postingKey,
            "id": req.session.userId,
            "content": content
        }
        res.status(200).send(result)
    } catch (error) {
        next(error)
    }
})

//댓글 읽기
router.get("/", checkLogout, async (req, res, next) => {
    const { postingKey } = req.body
    const sessionKey = req.session.userKey
    const result = {
        "message": "",
        "data": null
    }
    try {
        checkKey(postingKey, "게시물")

        const commentSql = "SELECT * FROM comment WHERE posting_key=$1 ORDER BY date"
        const commentQueryData = await queryModule(commentSql, [postingKey])

        const myCommnetSql = "SELECT * FROM comment WHERE account_key =$1 ORDER BY date" // 좋지 않음(삭제) 반복문을 돌려서 session 비교해서 같다면 commentQueryData에 (map으로) 컬럼 추가
        const myCommentQueryData = await queryModule(myCommnetSql, [sessionKey])

        result.message = "댓글 읽기 성공"
        result.data = { commentQueryData, myCommentQueryData }
        res.status(200).send(result)
    } catch (error) {
        next(error)
    }
})

//댓글 수정
router.put("/:idx", checkLogout, async (req, res, next) => {
    const { content } = req.body
    const commentKey = req.params.idx
    const sessionKey = req.session.userKey
    const result = {
        "message": "",
        "data": null
    }
    try {
        checkKey(commentKey, "댓글")
        checkTrim(content, "내용")

        const sql = "UPDATE comment SET content=$1 WHERE comment_key=$2 AND account_key =$3"
        await queryModule(sql, [content, commentKey, sessionKey])

        result.message = "댓글 수정 성공"
        result.data = {
            "commentKey": commentKey,
            "userKey": sessionKey,
            "content": content
        }
        res.status(200).send(result)

    } catch (error) {
        next(error)
    }
})

//댓글 삭제 
router.delete("/:idx", checkLogout, async (req, res, next) => {
    const commentKey = req.params.idx
    const sessionKey = req.session.userKey
    const result = {
        "message": ""
    }
    try {
        checkKey(commentKey, "댓글")

        const sql = "DELETE FROM comment WHERE comment_key= $1 AND account_key =$2"
        await queryModule(sql, [commentKey, sessionKey])
        result.message = "댓글 삭제 성공"
        res.status(200).send(result)
    } catch (error) {
        next(error)
    }
})

module.exports = router