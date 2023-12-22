const router = require("express").Router()
const connectMysql = require("../../database/connect/maria")
const { checkLogout } = require("../modules/error")

//게시물 쓰기
router.post("/", checkLogout, async (req, res, next) => {
    const { content, title } = req.body
    const result = {
        "message": "",
        "data": null
    }
    let connect
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

        connect = await connectMysql()
        const sql = 'INSERT INTO posting (user_key,title,content) VALUES (?,?,?)'
        const params = [req.session.userKey, title, content]
        await connect.execute(sql, params)

        result.message = "게시물 쓰기 성공"
        result.data = {
            "id": req.session.userId,
            "content": content,
            "title": title
        }
        res.status(200).send(result)
    } catch (error) {
        next(error)
    } finally {
        if (connect) {
            connect.end()
        }
    }
})

//전체 게시물 읽기
router.get("/", async (req, res, next) => {
    const result = {
        "message": "",
        "data": null
    }
    let connect
    try {
        connect = await connectMysql()
        const sql = "SELECT posting.*, user.id AS postingUser FROM posting JOIN user ON posting.user_key = user.user_key ORDER BY posting.date DESC"
        const queryResult = await connect.execute(sql)
        const queryData = queryResult[0]

        result.message = "전체 게시물 읽기 성공"
        result.data = queryData
        res.status(200).send(result)
    } catch (error) {
        next(error)
    } finally {
        if (connect) {
            connect.end()
        }
    }
})

//각 게시물 읽기
router.get("/:idx", checkLogout, async (req, res, next) => {
    const postingKey = req.params.idx
    const result = {
        "message": "",
        "data": null
    }
    let connect
    try {
        if (!postingKey || postingKey.trim() == "" || postingKey == undefined) {
            const error = new Error("받아온 게시물 키가 비어있음")
            error.status = 400
            throw error
        }

        connect = await connectMysql()
        const sql = "SELECT posting.*, user.id AS postingUser FROM posting JOIN user ON posting.user_key = user.user_key WHERE posting.posting_key =?"
        const params = [postingKey]
        const queryResult = await connect.execute(sql, params)
        const queryData = queryResult[0]

        if (queryData.length > 0) {
            result.message = "각 게시물 읽기 성공"
            result.data = queryData[0]
            res.status(200).send(result)
        } else {
            const error = new Error("게시물이 존재하지 않음")
            error.status = 404
            throw error
        }
    } catch (error) {
        next(error)
    } finally {
        if (connect) {
            connect.end()
        }
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
    let connect
    try {
        if (!postingKey || postingKey.trim() == "" || postingKey == undefined) {
            const error = new Error("받아온 게시물 키가 비어있음")
            error.status = 400
            throw error
        }

        connect = await connectMysql()
        const selectSql = "SELECT * FROM posting WHERE posting_key =?"
        const selectParams = [postingKey]
        const selectQueryResult = await connect.execute(selectSql, selectParams)
        const selectQueryData = selectQueryResult[0]

        if (selectQueryData.length > 0) {
            const userKey = selectQueryData[0].user_key
            if (userKey != sessionKey) {
                const error = new Error("게시글 작성자만 수정 가능함")
                error.status = 403
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
            const updateSql = "UPDATE posting SET content=?, title=? WHERE posting_key=?"
            const updateParams = [content, title, postingKey]
            await connect.execute(updateSql, updateParams)

            result.message = "게시물 수정 성공"
            result.data = {
                "postingKey": postingKey,
                "content": content,
                "title": title
            }
            res.status(200).send(result)
        } else {
            const error = new Error("게시물이 존재하지 않음")
            error.status = 404
            throw error
        }
    } catch (error) {
        next(error)
    } finally {
        if (connect) {
            connect.end()
        }
    }
})

//게시물 삭제
router.delete("/:idx", checkLogout, async (req, res, next) => {
    const postingKey = req.params.idx
    const sessionKey = req.session.userKey
    const result = {
        "message": ""
    }
    let connect
    try {
        if (!postingKey || postingKey.trim() == "" || postingKey == undefined) {
            const error = new Error("받아온 게시물 키가 비어있음")
            error.status = 400
            throw error
        }

        connect = await connectMysql()
        const selectSql = "SELECT * FROM posting WHERE posting_key =?"
        const selectParams = [postingKey]
        const selectQueryResult = await connect.execute(selectSql, selectParams)
        const selectQueryData = selectQueryResult[0]

        if (selectQueryData.length > 0) {
            const userKey = selectQueryData[0].user_key
            if (userKey != sessionKey) {
                const error = new Error("게시글 작성자만 삭제 가능함")
                error.status = 403
                throw error
            }
            const deleteSql = "DELETE FROM posting WHERE posting_key= ?"
            const deleteParams = [postingKey]
            await connect.execute(deleteSql, deleteParams)
            result.message = "게시물 삭제 성공"
            res.status(200).send(result)
        } else {
            const error = new Error("게시물이 존재하지 않음")
            error.status = 404
            throw error
        }
    } catch (error) {
        next(error)
    } finally {
        if (connect) {
            connect.end()
        }
    }
})

module.exports = router