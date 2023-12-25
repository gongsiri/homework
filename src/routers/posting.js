const router = require("express").Router()
const query = require("../../database/connect/maria")
const checkLogout = require("../middleware/checkLogout")

//게시물 쓰기
router.post("/", checkLogout, async (req, res, next) => {
    const { content, title } = req.body
    const result = {
        "message": "",
        "data": null
    }
    try {
        if (!content.trim()) {
            const error = new Error("내용이 공백임")
            error.status = 400
            throw error
        }
        if (!title.trim()) {
            const error = new Error("제목이 공백임")
            error.status = 400
            throw error
        }

        const sql = 'INSERT INTO posting (user_key,title,content) VALUES (?,?,?)'
        await query(sql, [req.session.userKey, title, content])

        result.message = "게시물 쓰기 성공"
        result.data = {
            "id": req.session.userId,
            "content": content,
            "title": title
        }
        res.status(200).send(result)
    } catch (error) {
        next(error)
    }
})

//전체 게시물 읽기
router.get("/", async (req, res, next) => {
    const result = {
        "message": "",
        "data": null
    }
    try {
        const sql = `SELECT posting.*, user.id AS postingUser 
                    FROM posting 
                    JOIN user ON posting.user_key = user.user_key 
                    ORDER BY posting.date DESC`
        const queryData = await query(sql)

        result.message = "전체 게시물 읽기 성공"
        result.data = queryData
        res.status(200).send(result)
    } catch (error) {
        next(error)
    }
})

//각 게시물 읽기
router.get("/:idx", checkLogout, async (req, res, next) => {
    const postingKey = req.params.idx
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

        const sql = `SELECT posting.*, user.id AS postingUser 
                    FROM posting 
                    JOIN user ON posting.user_key = user.user_key 
                    WHERE posting.posting_key =?`
        const queryData = await query(sql, [postingKey])

        if (queryData.length > 0) {
            result.message = "각 게시물 읽기 성공"
            result.data = queryData[0]
            res.status(200).send(result)
        } else {
            const error = new Error("게시물이 존재하지 않음")
            error.status = 204 // 404 말고 (통신은 되긴 했으니까) 굳이 필요 없음
            throw error
        }
    } catch (error) {
        next(error)
    }
})

//게시물 수정
router.put("/:idx", checkLogout, async (req, res, next) => {
    const { content, title } = req.body
    const postingKey = req.params.idx
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
        if (!content.trim()) {
            const error = new Error("내용이 공백임")
            error.status = 400
            throw error
        }
        if (!title.trim()) {
            const error = new Error("제목이 공백임")
            error.status = 400
            throw error
        }

        const updateSql = "UPDATE posting SET content=?, title=? WHERE posting_key=? AND user_key =?"
        await query(updateSql, [content, title, postingKey, sessionKey])

        result.message = "게시물 수정 성공"
        result.data = {
            "postingKey": postingKey,
            "content": content,
            "title": title
        }
        res.status(200).send(result)
    } catch (error) {
        next(error)
    }
})

//게시물 삭제
router.delete("/:idx", checkLogout, async (req, res, next) => {
    const postingKey = req.params.idx
    const sessionKey = req.session.userKey
    const result = {
        "message": ""
    }
    try {
        if (!postingKey || postingKey.trim() == "" || postingKey == undefined) {
            const error = new Error("받아온 게시물 키가 비어있음")
            error.status = 400
            throw error
        }

        const deleteSql = "DELETE FROM posting WHERE posting_key= ? AND user_key =?"
        await query(deleteSql, [postingKey, sessionKey])
        result.message = "게시물 삭제 성공"
        res.status(200).send(result)
    } catch (error) {
        next(error)
    }
})

module.exports = router