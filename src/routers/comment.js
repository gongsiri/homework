const router = require("express").Router()
const query = require("../../database/connect/maria")
const checkLogout = require("../middleware/checkLogout")

//댓글 쓰기
router.post("/", checkLogout, async (req, res, next) => {
    const { content, postingKey } = req.body
    const result = {
        "message": "",
        "data": null
    }
    try {
        if (!postingKey || postingKey.trim() == "" || postingKey == undefined) {
            const error = new Error("받아온 게시물 키가 비어있음")
            error.status = 400
            throw error
        }
        if (!content.trim()) {
            const error = new Error("내용이 공백임")
            error.status = 400
            throw error
        }

        const insertSql = 'INSERT INTO comment (user_key,posting_key,content) VALUES (?,?,?)'
        await query(insertSql, [req.session.userKey, postingKey, content])

        result.message = "댓글 쓰기 성공"
        result.data = {
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
        if (!postingKey || postingKey.trim() == "" || postingKey == undefined) {
            const error = new Error("받아온 게시물 키가 비어있음")
            error.status = 400
            throw error
        }

        const commentSql = "SELECT * FROM comment WHERE posting_key=? ORDER BY date"
        const commentQueryData = await query(commentSql, [postingKey])

        const myCommnetSql = "SELECT * FROM comment WHERE user_key =? ORDER BY date"
        const myCommentQueryData = await query(myCommnetSql, [sessionKey])

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
        if (!commentKey || commentKey.trim() == "" || commentKey == undefined) {
            const error = new Error("받아온 댓글 키가 비어있음")
            error.status = 400
            throw error
        }
        if (!content) {
            const error = new Error("내용이 공백임")
            error.status = 400
            throw error
        }

        const updateSql = "UPDATE comment SET content=? WHERE comment_key=? AND user_key =?"
        await query(updateSql, [content, commentKey, sessionKey])

        result.message = "댓글 수정 성공"
        result.data = {
            "commentKey": commentKey,
            "userKey": userKey,
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
        if (!commentKey || commentKey.trim() == "" || commentKey == undefined) {
            const error = new Error("받아온 댓글 키가 비어있음")
            error.status = 400
            throw error
        }

        const deleteSql = "DELETE FROM comment WHERE comment_key= ?" // session id를 넣어서 비교하는 거 추가
        await query(deleteSql, [commentKey])
        result.message = "댓글 삭제 성공"
        res.status(200).send(result)
    } catch (error) {
        next(error)
    }
})

module.exports = router