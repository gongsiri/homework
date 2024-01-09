const router = require("express").Router()
const queryModule = require("../modules/queryModule")
const checkCondition = require("../middleware/checkCondition")
const checkSame = require("../middleware/checkSame")
const isLogin = require("../middleware/isLogin")
const isLogout = require("../middleware/isLogout")
const selectPattern = require("../modules/selectPattern")
const logger = require("../config/loggerConfig")
const extractToken = require("../modules/extractToken")
const jwt = require("jsonwebtoken")
const idPattern = selectPattern.idPattern
const pwPattern = selectPattern.pwPattern
const namePattern = selectPattern.namePattern
const emailPattern = selectPattern.emailPattern
const birthPattern = selectPattern.birthPattern
const phonePattern = selectPattern.phonePattern

// isLogout -> 이미 로그인 된 상태입니다.
// isLogin -> 토큰이 없습니다(로그아웃 된 상태입니다)
//로그인
router.post("/login", isLogout, checkCondition("id", idPattern, true), checkCondition("pw", pwPattern), async (req, res, next) => {
    const { id, pw } = req.body
    const result = {
        "message": "",
        "data": {
            "token": ""
        }
    }
    try {
        const trimId = id.trim() // 아이디 앞뒤 공백 제거
        const sql = 'SELECT * FROM account WHERE id =$1 AND pw= $2'
        const queryData = await queryModule(sql, [trimId, pw])

        if (queryData.length === 0) {
            const error = new Error("로그인 실패")
            error.status = 401
            throw error
        }

        const token = jwt.sign(
            {
                "idx": queryData[0].account_key,
                "id": trimId,
                "name": queryData[0].name,
                "email": queryData[0].email,
                "birth": queryData[0].birth,
                "isAdmin": queryData[0].is_admin
            },
            process.env.SECRET_KEY,
            {
                "issuer": queryData[0].name,
                "expiresIn": "5m"
            }
        )
        result.data.token = token
        res.cookie("token", token, {
            maxAge: 300000
        })
        // req.session.isLogin = true
        // req.session.userId = trimId // 세션에 정보 저장
        // req.session.userKey = queryData[0].account_key
        // req.session.phone = queryData[0].phone
        // req.session.email = queryData[0].email
        // req.session.name = queryData[0].name
        // req.session.isAdmin = queryData[0].is_admin
        // req.session.save()
        logger(req, res, result) // 요청과 응답에 대한 로그를 기록
        res.status(200).send(result) // 클라이언트에게 결과 데이터 전송
    } catch (error) {
        next(error)
    }
})

//회원가입
router.post("/", isLogout, checkCondition("id", idPattern), checkCondition("pw", pwPattern), checkCondition("phone", phonePattern), checkCondition("email", emailPattern), checkCondition("birth", birthPattern), checkCondition("name", namePattern), checkSame("pw", "pwSame"), async (req, res, next) => {
    const { id, pw, phone, name, email, birth } = req.body
    const result = {
        "message": "",
        "data": null
    }
    try {
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

        result.data = {
            "id": id,
            "email": email,
            "name": name,
            "birth": birth
        }
        logger(req, res, result) // 요청과 응답에 대한 로그를 기록
        res.status(200).send(result) // 클라이언트에게 결과 데이터 전송
    } catch (error) {
        next(error)
    }
})

//로그아웃
router.post("/logout", isLogin, (req, res, next) => {
    const result = {
        "message": ""
    }
    try {
        res.clearCookie("token")
        logger(req, res, result) // 요청과 응답에 대한 로그를 기록
        res.status(200).send(result) // 클라이언트에게 결과 데이터 전송
    } catch (error) {
        next(error)
    }
})

//id 찾기
router.get("/findid", isLogout, checkCondition("email", emailPattern), checkCondition("name", namePattern, true), async (req, res, next) => {
    const { name, email } = req.body
    const result = {
        "message": "",
        "data": null
    }
    try {
        const trimName = name.trim()

        const sql = "SELECT id FROM account WHERE name = $1 AND email =$2"
        const queryData = await queryModule(sql, [trimName, email])

        if (queryData.length === 0) {
            const error = new Error("해당하는 계정이 없음")
            error.status = 404
            throw error
        }

        result.data = queryData[0]
        logger(req, res, result) // 요청과 응답에 대한 로그를 기록
        res.status(200).send(result) // 클라이언트에게 결과 데이터 전송  
    } catch (error) {
        next(error)
    }
})

//pw 찾기
router.get("/findpw", isLogout, checkCondition("email", emailPattern), checkCondition("id", idPattern, true), async (req, res, next) => {
    const { id, email } = req.body
    const result = {
        "message": "",
        "data": null
    }
    try {
        const trimId = id.trim()

        const sql = "SELECT pw FROM account WHERE id = $1 AND email =$2"
        const queryData = await queryModule(sql, [trimId, email])

        if (queryData.length === 0) {
            const error = new Error("해당하는 계정이 없음")
            error.status = 404
            throw error
        }

        result.data = queryData[0]
        logger(req, res, result) // 요청과 응답에 대한 로그를 기록
        res.status(200).send(result) // 클라이언트에게 결과 데이터 전송
    } catch (error) {
        next(error)
    }
})

//내 정보 보기 
router.get("/", isLogin, async (req, res, next) => {
    const idx = extractToken(req.cookies.token).idx
    const result = {
        "message": "", // 메시지
        "data": null // 사용자 정보
    }
    try {
        const sql = "SELECT * FROM account WHERE account_key=$1"
        const queryData = await queryModule(sql, [idx])

        if (queryData.length === 0) {
            const error = new Error("해당하는 계정이 없음")
            error.status = 404
            throw error
        }
        result.data = {
            "id": queryData[0].id,
            "name": queryData[0].name,
            "phone": queryData[0].phone,
            "birth": queryData[0].birth,
            "email": queryData[0].email
        }
        logger(req, res, result) // 요청과 응답에 대한 로그를 기록
        res.status(200).send(result) // 클라이언트에게 결과 데이터 전송
    } catch (error) {
        next(error)
    }
})

//내 정보 수정하기
router.put("/", isLogin, checkCondition("name", namePattern), checkCondition("phone", phonePattern), checkCondition("pw", pwPattern), checkCondition("birth", birthPattern), async (req, res, next) => {
    const { name, phone, pw, birth } = req.body
    const existingToken = req.cookies.token
    const idx = extractToken(existingToken).idx
    const result = {
        "message": "",
        "data": {
            "token": ""
        }
    }
    try {
        const sql = "UPDATE account SET pw=$1, name=$2, phone=$3, birth=$4 WHERE account_key=$5"
        await queryModule(sql, [pw, name, phone, birth, idx])

        const existingTokenData = extractToken(existingToken)

        existingTokenData.phone = phone
        existingTokenData.birth = birth
        existingTokenData.name = name

        const updatedToken = jwt.sign(
            existingTokenData,
            process.env.SECRET_KEY
        )
        res.cookie("token", updatedToken, {
            maxAge: 300000
        })
        result.data.token = updatedToken
        logger(req, res, result) // 요청과 응답에 대한 로그를 기록
        res.status(200).send(result) // 클라이언트에게 결과 데이터 전송
    } catch (error) {
        next(error)
    }
})

//회원 탈퇴하기
router.delete("/", isLogin, async (req, res, next) => {
    const result = {
        "message": ""
    }
    const userKey = extractToken(req.cookies.token).idx
    try {
        const sql = "DELETE FROM account WHERE account_key= $1"
        await queryModule(sql, [userKey])

        res.clearCookie('token')
        logger(req, res, result) // 요청과 응답에 대한 로그를 기록
        res.status(200).send(result) // 클라이언트에게 결과 데이터 전송
    } catch (error) {
        next(error)
    }
})

module.exports = router