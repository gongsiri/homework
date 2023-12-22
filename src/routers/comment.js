const router = require("express").Router()
const connectMysql = require("../../database/connect/maria")
const { checkLogout } = require("../modules/error")

//댓글 쓰기
router.post("/:idx", checkLogout, async (req, res, next) => {
    const postingKey = req.params.idx
    const { content } = req.body
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
        const selectSql = "SELECT * FROM posting WHERE posting_key = ?";
        const selectParams = [postingKey];
        const selectQueryResult = await connect.execute(selectSql, selectParams);
        const selectQueryData = selectQueryResult[0]

        if (selectQueryData.length === 0) {
            const error = new Error("해당하는 게시물이 존재하지 않습니다.");
            error.status = 404;
            throw error;
        }
        if (!content.trim()) {
            const error = new Error("내용이 공백임")
            error.status = 400
            throw error
        }

        const insertSql = 'INSERT INTO comment (user_key,posting_key,content) VALUES (?,?,?)'
        const insertParams = [req.session.userKey, postingKey, content]
        await connect.execute(insertSql, insertParams)

        result.message = "댓글 쓰기 성공"
        result.data = {
            "postingKey": postingKey,
            "id": req.session.userId,
            "content": content
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

//댓글 읽기
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
        const postingSql = "SELECT * FROM posting WHERE posting_key = ?";
        const postingParams = [postingKey];
        const postingQueryResult = await connect.execute(postingSql, postingParams);
        const postingQueryData = postingQueryResult[0]

        if (postingQueryData.length === 0) {
            const error = new Error("해당하는 게시물이 존재하지 않습니다.");
            error.status = 404;
            throw error;
        }

        const commentSql = "SELECT * FROM comment WHERE posting_key=? ORDER BY date"
        const commentParams = [postingKey]
        const commentQueryResult = await connect.execute(commentSql, commentParams)
        const commentQueryData = commentQueryResult[0]

        result.message = "댓글 읽기 성공"
        result.data = commentQueryData
        res.status(200).send(result)
    } catch (error) {
        next(error)
    } finally {
        if (connect) {
            connect.end()
        }
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
    let connect
    try {
        if (!commentKey || commentKey.trim() == "" || commentKey == undefined) {
            const error = new Error("받아온 댓글 키가 비어있음")
            error.status = 400
            throw error
        }

        connect = await connectMysql()
        const selectSql = "SELECT * FROM comment WHERE comment_key = ?"
        const selectParams = [commentKey]
        const selectQueryResult = await connect.execute(selectSql, selectParams)
        const selectQueryData = selectQueryResult[0]

        if (selectQueryData.length > 0) {
            const userKey = selectQueryData[0].user_key
            if (userKey != sessionKey) {
                const error = new Error("댓글 작성자만 수정 가능함")
                error.status = 403
                throw error
            }
            if (!content) {
                const error = new Error("내용이 공백임")
                error.status = 400
                throw error
            }
            const updateSql = "UPDATE comment SET content=? WHERE comment_key=?"
            const updateParams = [content, commentKey]
            await connect.execute(updateSql, updateParams)

            result.message = "댓글 수정 성공"
            result.data = {
                "commentKey": commentKey,
                "userKey": userKey,
                "content": content
            }
            res.status(200).send(result)
        } else {
            const error = new Error("댓글이 존재하지 않음")
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

//댓글 삭제 
router.delete("/:idx", checkLogout, async (req, res, next) => {
    const commentKey = req.params.idx
    const sessionKey = req.session.userKey
    const result = {
        "message": ""
    }
    let connect
    try {
        if (!commentKey || commentKey.trim() == "" || commentKey == undefined) {
            const error = new Error("받아온 댓글 키가 비어있음")
            error.status = 400
            throw error
        }

        connect = await connectMysql()
        const selectSql = "SELECT * FROM comment WHERE comment_key =?"
        const selectParams = [commentKey]
        const selectQueryResult = await connect.execute(selectSql, selectParams)
        const selectQueryData = selectQueryResult[0]

        if (selectQueryData.length > 0) {
            const userKey = selectQueryData[0].user_key
            if (userKey != sessionKey) {
                const error = new Error("댓글 작성자만 삭제 가능함")
                error.status = 403
                throw error
            }
            const deleteSql = "DELETE FROM comment WHERE comment_key= ?"
            const deleteParams = [commentKey]
            await connect.execute(deleteSql, deleteParams)
            result.message = "댓글 삭제 성공"
            res.status(200).send(result)
        } else {
            const error = new Error("댓글이 존재하지 않음")
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