const router = require("express").Router()
const queryModule = require("../../database/connect/postgres")
const checkLogout = require("../middleware/checkLogout")
const checkTrim = require("../modules/checkTrim")
const checkKey = require("../modules/checkKey")

//게시물 쓰기
router.post("/", checkLogout, async (req, res, next) => {
    const { content, title } = req.body
    const result = {
        "message": "",
        "data": null
    }
    try {
        checkTrim(content, "내용")
        checkTrim(title, "제목")

        const sql = 'INSERT INTO posting (account_key,title,content) VALUES ($1,$2,$3)'
        await queryModule(sql, [req.session.userKey, title, content])

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
        const sql = `SELECT posting.*, account.id AS postingUser 
                    FROM posting 
                    JOIN account ON posting.account_key = account.account_key 
                    ORDER BY posting.date DESC`
        const queryData = await queryModule(sql)

        result.message = "전체 게시물 읽기 성공"
        result.data = queryData
        res.status(200).send(result)
    } catch (error) {
        next(error)
    }
})

//각 게시물 읽기
router.get("/:idx", checkLogout, async (req, res, next) => { // 여기도 내 거인지 아닌지 줘야 함
    const postingKey = req.params.idx
    const result = {
        "message": "",
        "data": null
    }
    try {
        checkKey(postingKey, "게시물")

        const sql = `SELECT posting.*, account.id AS postingUser 
                    FROM posting 
                    JOIN account ON posting.account_key = account.account_key 
                    WHERE posting.posting_key =$1`
        const queryData = await queryModule(sql, [postingKey])

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
        checkKey(postingKey, "게시물")
        checkTrim(content, "내용")
        checkTrim(title, "제목")

        const sql = "UPDATE posting SET content=$1, title=$2 WHERE posting_key=$3 AND account_key =$4"
        await queryModule(sql, [content, title, postingKey, sessionKey])

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
        checkKey(postingKey, "게시물")

        const sql = "DELETE FROM posting WHERE posting_key= $1 AND account_key =$2"
        await queryModule(sql, [postingKey, sessionKey])
        result.message = "게시물 삭제 성공"
        res.status(200).send(result)
    } catch (error) {
        next(error)
    }
})

module.exports = router