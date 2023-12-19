const router = require("express").Router()
const maria = require("mysql2/promise")
const mariaOption = require("../../database/connect/maria")

const checkCondition = (value, pattern, input) => { // 모듈화
    if (!pattern.test(value)) {
        const error = new Error(`${input}이(가) 입력 양식에 맞지 않음`)
        error.status = 400
        throw error
      }
}

//로그인
router.post("/login", (req,res) => {
    const { id, pw } = req.body

    const idPattern = /^[a-zA-Z0-9]{4,20}$/
    const pwPattern = /^(?=.*[a-zA-Z])(?=.*[!@#$%^*+=-])(?=.*[0-9]).{8,30}$/

    const result = {
        "message" : "", // 메시지
        "data" : null // 사용자 정보
    }
    try{
        if(req.session.isLogin){ // success 필요 없음
            const error = new Error("이미 로그인 되어 있음")
            error.status = 401
            throw error
        }
        const trimId = id.trim() // 아이디 앞뒤 공백 제거
        checkCondition(trimId,idPattern,"아이디")
        checkCondition(pw,pwPattern,"비밀번호")

        const sql = "SELECT * FROM user WHERE id = ? AND pw =?"
        const params = [trimId, pw]

        maria.query(sql, params, (err, rows, fields) => {
            if(rows.length>0){
                const user = rows[0]
                result.message = "로그인 성공"
                result.data = { // DB에서 가져온 값들을 넣어줌
                    "userKey" : user.user_key, 
                    "id" : user.id,
                    "email" : user.email,
                    "name" : user.name
                }
                // req.session.isLogin = true
                // req.session.id = trimId // 세션에 정보 저장
                // req.session.userKey = keyValue
                // req.session.phone = phoneValue
                // req.session.email = emailValue
                // req.session.name = nameValue
                res.status(200).send(result)
            } else{
                const error = new Error("로그인 실패")
                error.status = 401
                throw error
            }
        })
    } catch (error){
        result.message = error.message || "오류 발생"
        res.status(error.status || 500).send(result)
    }
})

//회원가입
router.post("/", async (req,res) => {
    const { id, pw, pw_same, phone, name, email, birth } = req.body

    const idPattern = /^[a-zA-Z0-9]{4,20}$/
    const pwPattern = /^(?=.*[a-zA-Z])(?=.*[!@#$%^*+=-])(?=.*[0-9]).{8,30}$/
    const phonePattern = /^01[0179][0-9]{7,8}$/
    const emailPattern = /^[0-9a-zA-Z._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
    const birthPattern = /^(19|20)[0-9]{2}(0[1-9]|1[0-2])(0[1-9]|[1-2][0-9]|3[0-1])$/
    const namePattern = /^[가-힣]{2,5}$/
    const idDuplication = false // 아이디 중복 아닐 시 false, 중복일 시 true
    const emailDuplication = false // 이메일 중복 아닐 시 false, 중복일 시 true

    const result = {
        "message" : "", // 메시지
        "data" : null // 사용자 정보
    }
    try{
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
        if(idDuplication){
            const error = new Error("아이디가 중복됨")
            error.status = 400
            throw error
        }
        if(emailDuplication){
            const error = new Error("이메일이 중복됨")
            error.status = 400
            throw error
        }
        const dbClient = await maria.createConnection(mariaOption) // select문으로 감싸자, end로 끊어주자
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
        dbClient.end()
    } catch (error){
        result.message = error.message || "오류 발생"
        res.status(error.status || 500).send(result)
        if(err)
    }
    // maria.query(sql,params,(err, rows, fields) => {
    //     if(err){
    //         console.log(err)
    //         res.status(500).send("오류")
    //         return
    //     }
    //     result.message = "회원가입 성공"
    //     result.data = {
    //         "id" : id,
    //         "email" : email,
    //         "name" : name,
    //         "birth" : birth
    //     }
    //     res.status(200).send(result)
    // })
})

//로그아웃
router.post("/logout", (req,res) => {
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
        result.message = error.message || "오류 발생"
        res.status(error.status || 500).send(result)
    }
})

//id 찾기
router.get("/findid", (req,res) => {
    const { name, email } = req.body

    const emailPattern = /^[0-9a-zA-Z._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
    const namePattern = /^[가-힣]{2,5}$/
    const isUser = false // 해당하는 계정이 있는지

    const result = {
        "message" : "", // 메시지
        "data" : null // 사용자 정보
    }
    try{
        checkCondition(email,emailPattern,"이메일")
        const trimName = name.trim()
        checkCondition(trimName,namePattern,"이름")

        if(!isUser){
            const error = new Error("해당하는 계정이 없음")
            error.status = 404
            throw error
        }
        result.message = "id 찾기 성공"
        result.data = {
            "id" : id
        }
        res.status(200).send(result)
    } catch (error){
        result.message = error.message || "오류 발생"
        res.status(error.status || 500).send(result)
    }
})

//pw 찾기
router.get("/findpw", (req,res) => {
    const { id, email } = req.body

    const idPattern = /^[a-zA-Z0-9]{4,20}$/
    const emailPattern = /^[0-9a-zA-Z._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/ 
    const isUser = false // 해당하는 계정이 있는지

    const result = {
        "message" : "", // 메시지
        "data" : null // 사용자 정보
    }
    try{
        checkCondition(email,emailPattern,"이메일")
        const trimId = id.trim()
        checkCondition(trimId,idPattern,"이메일")

        if(!isUser){
            const error = new Error("해당하는 계정이 없음")
            error.status = 404
            throw error
        }
        result.message = "pw 찾기 성공"
        result.data = {
            "pw" : pw
        }
        res.status(200).send(result)
    } catch (error){
        result.message = error.message || "오류 발생"
        res.status(error.status || 500).send(result)
    }
})

//내 정보 보기 
router.get("/", (req,res) => {
    const isLogin = req.session.isLogin
    const id = req.session.id
    const userKey = req.session.userKey
    const pw = req.session.pw
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
            "userKey" : req.session.userKey,
            "id" : req.session.id,
            "email" : req.session.email,
            "name" : req.session.name,
        }
        res.status(200).send(result)
    } catch (error){
        result.message = error.message || "오류 발생"
        res.status(error.status || 500).send(result)
    }
})

//내 정보 수정하기
router.put("/", (req,res) => {
    const { email, name, phone, pw, birth } = req.body
    const isLogin = req.session.isLogin
    const pwPattern = /^(?=.*[a-zA-Z])(?=.*[!@#$%^*+=-])(?=.*[0-9]).{8,30}$/
    const phonePattern = /^01[0179][0-9]{7,8}$/
    const emailPattern = /^[0-9a-zA-Z._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
    const birthPattern = /^(19|20)[0-9]{2}(0[1-9]|1[0-2])(0[1-9]|[1-2][0-9]|3[0-1])$/
    const namePattern = /^[가-힣]{2,5}$/

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
        checkCondition(pw,pwPattern,"비밀번호")
        checkCondition(phone,phonePattern,"전화번호")
        checkCondition(email,emailPattern,"이메일")
        checkCondition(birth,birthPattern,"생년월일")
        checkCondition(name,namePattern,"이름")

        result.message = "내 정보 수정 성공"
        result.data = { // 새로 입력한 정보를 보내줌
            "userKey" : userKey, 
            "id" : id,
            "email" : email,
            "name" : name
        }
        res.status(200).send(result)
    } catch (error){
        result.message = error.message || "오류 발생"
        res.status(error.status || 500).send(result)
    }
})

//회원 탈퇴하기
router.delete("/", (req,res) => {
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
        result.message = error.message || "오류 발생"
        res.status(error.status || 500).send(result)
    }
})

module.exports = router