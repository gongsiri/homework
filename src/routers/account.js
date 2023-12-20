const router = require("express").Router()
const connectMysql = require("../../database/connect/maria")

const idPattern = /^[a-zA-Z0-9]{4,20}$/
const pwPattern = /^(?=.*[a-zA-Z])(?=.*[!@#$%^*+=-])(?=.*[0-9]).{8,30}$/
const phonePattern = /^01[0179][0-9]{7,8}$/
const emailPattern = /^[0-9a-zA-Z._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
const birthPattern = /^(19|20)[0-9]{2}(0[1-9]|1[0-2])(0[1-9]|[1-2][0-9]|3[0-1])$/
const namePattern = /^[가-힣]{2,5}$/

const checkCondition = (value, pattern, input) => {
    if (!pattern.test(value)) {
        const error = new Error(`${input}이(가) 입력 양식에 맞지 않음`)
        error.status = 400
        throw error
    }
}

//로그인
router.post("/login", async (req,res,next) => {
    const { id, pw } = req.body
    const result = {
        "message" : "", // 메시지
        "data" : null // 사용자 정보
    }
    let connect
    let userKey
    let userPhone
    let userEmail
    let userName
    let userDate
    try{
        if(req.session.isLogin){ // success 필요 없음
            const error = new Error("이미 로그인 되어 있음")
            error.status = 401
            throw error
        }
        const trimId = id.trim() // 아이디 앞뒤 공백 제거
        checkCondition(trimId,idPattern,"아이디")
        checkCondition(pw,pwPattern,"비밀번호")

        connect = await connectMysql()
        const sql = 'SELECT * FROM user WHERE id =? AND pw= ?'
        const params = [trimId, pw]
        const queryResult = await connect.execute(sql,params) // 여기에 sql과 params은 []로 만들자
    
        if(queryResult[0].length>0){
            const user = queryResult[0][0]
            userKey = user.user_key
            userPhone = user.phone
            userEmail = user.email
            userName = user.name
            userDate = user.date

            result.message = "로그인 성공"
            result.data = {
                "id" : trimId,
                "name": userName,
                "userKey" : userKey,
                "email" : userEmail,
                "date" : userDate,
            }
            req.session.isLogin = true
            req.session.userId = trimId // 세션에 정보 저장
            req.session.userKey = userKey
            req.session.phone = userPhone
            req.session.email =userEmail
            req.session.name = userName
            req.session.save()
            res.status(200).send(result)
        }
        else{
            const error = new Error("로그인 실패")
            error.status = 401
            throw error
        }
    } catch (error){
        next(error)
    } finally {
        if(connect){
            connect.end()
        }
    }
})

//회원가입
router.post("/", async (req,res,next) => {
    const { id, pw, pw_same, phone, name, email, birth } = req.body

    const result = {
        "message" : "", // 메시지
        "data" : null // 사용자 정보
    }
    let connect
    try{
        console.log("로그인 상태",req.session.isLogin)
        if(req.session.isLogin){
            const error = new Error("이미 로그인 되어 있음")
            error.status = 401
            throw error
        }
        checkCondition(id,idPattern,"아이디")
        checkCondition(pw,pwPattern,"비밀번호")
        checkCondition(phone,phonePattern,"전화번호")
        checkCondition(email,emailPattern,"이메일")
        checkCondition(birth,birthPattern,"생년월일")
        checkCondition(name,namePattern,"이름")

        if(!pw_same || pw_same !== pw){
            const error = new Error("비밀번호가 일치하지 않음")
            error.status = 400
            throw error
        }

        connect = await connectMysql()
        const idSql = "SELECT id FROM user WHERE id = ?"
        const idParams = [id]
        const idQueryResult = await dbClient.execute(idSql,idParams)
        console.log("아이디중복",idQueryResult)
        if(idQueryResult[0].length>0){
            const error = new Error("아이디가 중복됨")
            error.status = 400
            throw error
        }

        const emailSql = "SELECT * FROM user WHERE email = ?"
        const emailParams = [email]
        const emailQueryResult = await dbClient.execute(emailSql,emailParams)
        if(emailQueryResult[0].length>0){
            const error = new Error("이메일이 중복됨")
            error.status = 400
            throw error
        }

        const sql = 'INSERT INTO user (id,pw,phone,name,email,birth) VALUES (?,?,?,?,?,?)'
        const params = [id, pw, phone, name, email, birth]
        const queryResult = await dbClient.execute(sql,params) // 여기에 sql과 params은 []로 만들자
        console.log(queryResult)
        result.message = "회원가입 성공"
        result.data = {
            "id" : id,
            "email" : email,
            "name" : name,
            "birth" : birth
        }
        res.status(200).send(result)
    } catch (error){
        next(error)
    } finally {
        if(connect){
            connect.end()
        }
    }
})

//로그아웃
router.post("/logout", (req,res,next) => {
    const result = {
        "message" : "" // 메시지
    }
    try{
        if(!req.session.isLogin){
            const error = new Error("로그인 되어 있지 않음")
            error.status = 401
            throw error
        }
        result.message = "로그아웃 성공"
        req.session.destroy() // 세션 삭제
        res.status(200).send(result)
    } catch (error){
        next(error)
    }
})

//id 찾기
router.get("/findid", async (req,res,next) => {
    const { name, email } = req.body

    const result = {
        "message" : "", // 메시지
        "data" : null // 사용자 정보
    }
    let connect

    try{
        checkCondition(email,emailPattern,"이메일")
        const trimName = name.trim()
        checkCondition(trimName,namePattern,"이름")

        connect = await connectMysql()
        const sql = "SELECT id FROM user WHERE name = ? AND email =?"
        const params = [trimName, email]
        const queryResult = await dbClient.execute(sql,params)

        if(queryResult[0].length>0){
            result.message = "id 찾기 성공"
            result.data = {
                "id" : queryResult[0][0]
            }
            res.status(200).send(result)
        } else {
            const error = new Error("해당하는 계정이 없음")
            error.status = 404
            throw error
        }
    } catch (error){
        next(error)
    } finally{
        if(connect){
            connect.end()
        }
    }
})

//pw 찾기
router.get("/findpw", async (req,res,next) => {
    const { id, email } = req.body

    const result = {
        "message" : "", // 메시지
        "data" : null // 사용자 정보
    }
    let connect
    try{
        checkCondition(email,emailPattern,"이메일")
        const trimId = id.trim()
        checkCondition(trimId,idPattern,"아이디")

        connect = await connectMysql()
        const sql = "SELECT pw FROM user WHERE id = ? AND email =?"
        const params = [trimId, email]
        const queryResult = await dbClient.execute(sql,params)

        if(queryResult[0].length>0){
            result.message = "pw 찾기 성공"
            result.data = {
                "pw" : queryResult[0][0]
            }
            res.status(200).send(result)
        } else {
            const error = new Error("해당하는 계정이 없음")
            error.status = 404
            throw error
        }
    } catch (error){
        next(error)
    } finally {
        if(connect){
            connect.end()
        }
    }
})

//내 정보 보기 
router.get("/", (req,res,next) => {
    const isLogin = req.session.isLogin
    const id = req.session.userId
    const userKey = req.session.userKey
    const phone = req.session.phone
    const email =req.session.email
    const name = req.session.name
    const birth = req.session.birth
    
    const result = {
        "message" : "", // 메시지
        "data" : null // 사용자 정보
    }
    try{
        if(!isLogin){
            const error = new Error("로그인 되어 있지 않음")
            error.status = 401
            throw error
        }
        result.message = "내 정보 보기 성공"
        result.data = {
            "userKey" : userKey,
            "id" : id,
            "email" : email,
            "name" : name,
            "phone" : phone,
            "birth" : birth
        }
        res.status(200).send(result)
    } catch (error){
        next(error)
    }
})

//내 정보 수정하기
router.put("/", async (req,res,next) => {
    const { name, phone, pw, birth } = req.body
    const isLogin = req.session.isLogin
    const result = {
        "message" : "", // 메시지
        "data" : null // 사용자 정보
    }
    let connect
    try{
        if(!isLogin){
            const error = new Error("로그인 되어 있지 않음")
            error.status = 401
            throw error
        }
        connect = await connectMysql()
        const sql = "UPDATE user SET pw=?, name=?, phone=?, birth=? WHERE user_key=?"
        const params = [pw, name, phone, birth,req.session.userKey]
        await connect.execute(sql,params)

        result.message = "내 정보 수정 성공"
        result.data = { // 새로 입력한 정보를 보내줌
            "userKey" : req.session.userKey, 
            "id" : req.session.userId,
            "email" : req.session.email,
            "name" : req.session.name,
            "birth": req.session.birth
        }
        req.session.phone = phone
        req.session.birth =birth
        req.session.name = name
        res.status(200).send(result)
    } catch (error){
        next(error)
    } finally {
        if(connect){
            connect.end()
        }
    }
})

//회원 탈퇴하기
router.delete("/", (req,res,next) => {
    const isLogin = req.session.isLogin
    const result = {
        "message" : "" // 메시지
    }
    try{
        if(!isLogin){
            const error = new Error("로그인 되어 있지 않음")
            error.status = 401
            throw error
        }
        result.message = "회원 탈퇴 성공"
        req.session.destroy() //로그아웃
        res.status(200).send(result)
    } catch (error){
        next(error)
    }
})

module.exports = router