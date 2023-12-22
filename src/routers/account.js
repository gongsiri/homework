const router = require("express").Router()
const connectMysql = require("../../database/connect/maria")
const { checkCondition, checkLogin, checkLogout, checkPwMatch } = require("../modules/error")

//정규식
const idPattern = /^[a-zA-Z0-9]{4,20}$/
const pwPattern = /^(?=.*[a-zA-Z])(?=.*[!@#$%^*+=-])(?=.*[0-9]).{8,30}$/
const phonePattern = /^01[0179][0-9]{7,8}$/
const emailPattern = /^[0-9a-zA-Z._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
const birthPattern = /^(19|20)[0-9]{2}(0[1-9]|1[0-2])(0[1-9]|[1-2][0-9]|3[0-1])$/
const namePattern = /^[가-힣]{2,5}$/

//로그인
router.post("/login", checkLogin, async (req, res, next) => {
    const { id, pw } = req.body
    const result = {
        "message": ""
    }
    let connect
    try {
        const trimId = id.trim() // 아이디 앞뒤 공백 제거
        checkCondition(trimId, idPattern, "아이디") // 유효성 검사
        checkCondition(pw, pwPattern, "비밀번호")

        connect = await connectMysql()
        const sql = 'SELECT * FROM user WHERE id =? AND pw= ?'
        const params = [trimId, pw]
        const queryResult = await connect.execute(sql, params)
        const queryData = queryResult[0]

        if (queryData.length > 0) {
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
    } finally {
        if (connect) {
            connect.end() // 연결을 끊어줌
        }
    }
})

//회원가입
router.post("/", checkLogin, async (req, res, next) => {
    const { id, pw, pw_same, phone, name, email, birth } = req.body
    const result = {
        "message": "",
        "data": null
    }
    let connect
    try {
        checkCondition(id, idPattern, "아이디")
        checkCondition(pw, pwPattern, "비밀번호")
        checkCondition(phone, phonePattern, "전화번호")
        checkCondition(email, emailPattern, "이메일")
        checkCondition(birth, birthPattern, "생년월일")
        checkCondition(name, namePattern, "이름")
        checkPwMatch(pw, pw_same)

        connect = await connectMysql()
        const idSql = "SELECT id FROM user WHERE id = ?"
        const idParams = [id]
        const idQueryResult = await connect.execute(idSql, idParams)
        const idQueryData = idQueryResult[0]

        if (idQueryData.length > 0) {
            const error = new Error("아이디가 중복됨")
            error.status = 400
            throw error
        }

        const emailSql = "SELECT * FROM user WHERE email = ?"
        const emailParams = [email]
        const emailQueryResult = await connect.execute(emailSql, emailParams)
        const emailQueryData = emailQueryResult[0]

        if (emailQueryData.length > 0) {
            const error = new Error("이메일이 중복됨")
            error.status = 400
            throw error
        }

        const insertSql = 'INSERT INTO user (id,pw,phone,name,email,birth) VALUES (?,?,?,?,?,?)'
        const insertParams = [id, pw, phone, name, email, birth]
        await connect.execute(insertSql, insertParams)
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
    } finally {
        if (connect) {
            connect.end()
        }
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
router.get("/findid", checkLogin, async (req, res, next) => {
    const { name, email } = req.body
    const result = {
        "message": "",
        "data": null
    }
    let connect
    try {
        checkCondition(email, emailPattern, "이메일")
        const trimName = name.trim()
        checkCondition(trimName, namePattern, "이름")

        connect = await connectMysql()
        const sql = "SELECT id FROM user WHERE name = ? AND email =?"
        const params = [trimName, email]
        const queryResult = await connect.execute(sql, params)
        const queryData = queryResult[0]

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
    } finally {
        if (connect) {
            connect.end()
        }
    }
})

//pw 찾기
router.get("/findpw", checkLogin, async (req, res, next) => {
    const { id, email } = req.body
    const result = {
        "message": "",
        "data": null
    }
    let connect
    try {
        checkCondition(email, emailPattern, "이메일")
        const trimId = id.trim()
        checkCondition(trimId, idPattern, "아이디")

        connect = await connectMysql()
        const sql = "SELECT pw FROM user WHERE id = ? AND email =?"
        const params = [trimId, email]
        const queryResult = await connect.execute(sql, params)
        const queryData = queryResult[0]

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
    } finally {
        if (connect) {
            connect.end()
        }
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
router.put("/", checkLogout, async (req, res, next) => {
    const { name, phone, pw, birth } = req.body
    const result = {
        "message": "",
        "data": null
    }
    let connect
    try {
        checkCondition(name, namePattern, "이름")
        checkCondition(phone, phonePattern, "전화번호")
        checkCondition(pw, pwPattern, "비밀번호")
        checkCondition(birth, birthPattern, "생년월일")

        connect = await connectMysql()
        const sql = "UPDATE user SET pw=?, name=?, phone=?, birth=? WHERE user_key=?"
        const params = [pw, name, phone, birth, req.session.userKey]
        await connect.execute(sql, params)

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
    } finally {
        if (connect) {
            connect.end()
        }
    }
})

//회원 탈퇴하기
router.delete("/", checkLogout, async (req, res, next) => {
    const result = {
        "message": ""
    }
    const userKey = req.session.userKey
    let connect
    try {
        connect = await connectMysql()
        const sql = "DELETE FROM user WHERE user_key= ?"
        const params = [userKey]
        await connect.execute(sql, params)

        result.message = "회원 탈퇴 성공"
        req.session.destroy() //로그아웃
        res.status(200).send(result)
    } catch (error) {
        next(error)
    }
})

module.exports = router