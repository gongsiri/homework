const router = require("express").Router()
const queryModule = require("../modules/queryModule")
const checkCondition = require("../modules/checkCondition")
const checkSame = require("../modules/checkSame")
const checkLogin = require("../middleware/checkLogin")
const checkLogout = require("../middleware/checkLogout")
const selectPattern = require("../modules/selectPattern")
const idPattern = selectPattern.idPattern
const pwPattern = selectPattern.pwPattern
const namePattern = selectPattern.namePattern
const emailPattern = selectPattern.emailPattern
const birthPattern = selectPattern.birthPattern
const phonePattern = selectPattern.phonePattern

//로그인
router.post("/login", checkLogin, checkCondition("id", idPattern), checkCondition("pw", pwPattern), async (req, res, next) => {
    const { id, pw } = req.body
    const result = {
        "message": ""
    }
    try {
        const trimId = id.trim() // 아이디 앞뒤 공백 제거
        const sql = 'SELECT * FROM account WHERE id =$1 AND pw= $2'
        const queryData = await queryModule(sql, [trimId, pw])

        if (queryData.length > 0) { // 성공 실패 순서 바꾸기
            result.message = "로그인 성공"

            req.session.isLogin = true
            req.session.userId = trimId // 세션에 정보 저장
            req.session.userKey = queryData[0].user_key
            req.session.phone = queryData[0].phone
            req.session.email = queryData[0].email
            req.session.name = queryData[0].name
            req.session.save()
            res.status(200).send(result)
        }
        else {
            const error = new Error("로그인 실패")
            error.status = 401
            throw error
        }
    } catch (error) {
        next(error)
    }
})

//회원가입
router.post("/", checkLogin, checkCondition("id", idPattern), checkCondition("pw", pwPattern), checkCondition("phone", phonePattern), checkCondition("email", emailPattern), checkCondition("birth", birthPattern), checkCondition("name", namePattern), async (req, res, next) => {
    const { id, pw, pw_same, phone, name, email, birth } = req.body
    const result = {
        "message": "",
        "data": null
    }
    try {
        checkSame(pw, pw_same, "비밀번호")

        const idSql = "SELECT id FROM account WHERE id = $1"
        const idQueryData = await queryModule(idSql, [id])

        if (idQueryData.length > 0) {
            const error = new Error("아이디가 중복됨")
            error.status = 400
            throw error
        }

        const emailSql = "SELECT * FROM account WHERE email = $1"
        const emailQueryData = await queryModule(emailSql, [email])

        if (emailQueryData.length > 0) {
            const error = new Error("이메일이 중복됨")
            error.status = 400
            throw error
        }

        const insertSql = 'INSERT INTO account (id,pw,phone,name,email,birth) VALUES ($1,$2,$3,$4,$5,$6)'
        await queryModule(insertSql, [id, pw, phone, name, email, birth])

        result.message = "회원가입 성공"
        result.data = {
            "id": id,
            "email": email,
            "name": name,
            "birth": birth
        }
        res.status(200).send(result)
    } catch (error) {
        next(error)
    }
})

//로그아웃
router.post("/logout", checkLogout, (req, res, next) => {
    const result = {
        "message": ""
    }
    try {
        result.message = "로그아웃 성공"
        req.session.destroy() // 세션 삭제
        res.status(200).send(result)
    } catch (error) {
        next(error)
    }
})

//id 찾기
router.get("/findid", checkLogin, checkCondition("email", emailPattern), checkCondition("name", namePattern), async (req, res, next) => {
    const { name, email } = req.body
    const result = {
        "message": "",
        "data": null
    }
    try {
        const trimName = name.trim()

        const sql = "SELECT id FROM account WHERE name = $1 AND email =$2"
        const queryData = await queryModule(sql, [trimName, email])

        if (queryData.length > 0) {
            result.message = "id 찾기 성공"
            result.data = queryData[0]
            res.status(200).send(result)
        } else {
            const error = new Error("해당하는 계정이 없음")
            error.status = 404
            throw error
        }
    } catch (error) {
        next(error)
    }
})

//pw 찾기
router.get("/findpw", checkLogin, checkCondition("email", emailPattern), checkCondition("id", idPattern), async (req, res, next) => {
    const { id, email } = req.body
    const result = {
        "message": "",
        "data": null
    }
    try {
        const trimId = id.trim()

        const sql = "SELECT pw FROM account WHERE id = $1 AND email =$2"
        const queryData = await queryModule(sql, [trimId, email])

        if (queryData.length > 0) {
            result.message = "pw 찾기 성공"
            result.data = queryData[0]
            res.status(200).send(result)
        } else {
            const error = new Error("해당하는 계정이 없음")
            error.status = 404
            throw error
        }
    } catch (error) {
        next(error)
    }
})

//내 정보 보기 
router.get("/", checkLogout, (req, res, next) => {
    const id = req.session.userId
    const userKey = req.session.userKey
    const phone = req.session.phone
    const email = req.session.email
    const name = req.session.name
    const birth = req.session.birth
    const result = {
        "message": "", // 메시지
        "data": null // 사용자 정보
    }
    try {
        result.message = "내 정보 보기 성공"
        result.data = {
            "userKey": userKey,
            "id": id,
            "email": email,
            "name": name,
            "phone": phone,
            "birth": birth
        }
        res.status(200).send(result)
    } catch (error) {
        next(error)
    }
})

//내 정보 수정하기
router.put("/", checkLogout, checkCondition("name", namePattern), checkCondition("phone", phonePattern), checkCondition("pw", pwPattern), checkCondition("birth", birthPattern), async (req, res, next) => {
    const { name, phone, pw, birth } = req.body
    const result = {
        "message": "",
        "data": null
    }
    try {
        const sql = "UPDATE account SET pw=$1, name=$2, phone=$3, birth=$4 WHERE account_key=$5"
        await queryModule(sql, [pw, name, phone, birth, req.session.userKey])

        result.message = "내 정보 수정 성공"
        result.data = { // 새로 입력한 정보를 보내줌
            "userKey": req.session.userKey,
            "id": req.session.userId,
            "email": req.session.email,
            "name": req.session.name,
            "birth": req.session.birth
        }
        req.session.phone = phone
        req.session.birth = birth
        req.session.name = name
        res.status(200).send(result)
    } catch (error) {
        next(error)
    }
})

//회원 탈퇴하기
router.delete("/", checkLogout, async (req, res, next) => {
    const result = {
        "message": ""
    }
    const userKey = req.session.userKey
    try {
        const sql = "DELETE FROM account WHERE account_key= $1"
        await queryModule(sql, [userKey])

        result.message = "회원 탈퇴 성공"
        req.session.destroy() //로그아웃
        res.status(200).send(result)
    } catch (error) {
        next(error)
    }
})

module.exports = router