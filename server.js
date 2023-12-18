const express = require("express")
const session = require("express-session") // 세션const app = express()
const port = 8001

app.use(session({
    secret : 'session', // 세션을 암호화하는 데 사용됨
    resave : false, // 계속 새로 발급하지 않음
    saveUninitialized : true, // 세션 사용하기 전까지 미발급
}))

//로그인
app.post("/account/login", (req,res) => {
    const { id, pw } = req.body

    const idPattern = /^[a-zA-Z0-9]{4,20}$/
    const pwPattern = /^(?=.*[a-zA-Z])(?=.*[!@#$%^*+=-])(?=.*[0-9]).{8,30}$/

    const result = {
        "message" : "", // 메시지
        "data" : null // 사용자 정보
    }
    try{
        if(req.session.isLogin){ // success 필요 없음
            result.message = "이미 로그인 되어 있음"
            return res.status(401).send(result)
        }
        const trimId = id.trim() // 아이디 앞뒤 공백 제거
        if(!idPattern.test(trimId)){
            result.message = "아이디가 입력 양식에 맞지 않음"
            return res.status(400).send(result)
        }
        if(!pwPattern.test(pw)){
            result.message = "비밀번호가 입력 양식에 맞지 않음"
            return res.status(400).send(result)
        }
        if(pw !==pwValue){
            result.message = "로그인 실패"
            return res.status(400).send(result)
        }
        result.message = "로그인 성공"
        result.data = { // DB에서 가져온 값들을 넣어줌
            "userKey" : keyValue, 
            "id" : trimId,
            "email" : emailValue,
            "name" : nameValue
        }
        req.session.isLogin = true
        req.session.id = trimId // 세션에 정보 저장
        req.session.userKey = keyValue
        req.session.phone = phoneValue
        req.session.email = emailValue
        req.session.name = nameValue
        res.status(200).send(result)
    } catch (error){
        result.message = "오류 발생"
        res.status(500).send(result)
    }
})

//회원가입
app.post("/account", (req,res) => {
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
            result.message = "이미 로그인 되어 있음"
            return res.status(401).send(result)
        }
        if(!idPattern.test(id)){
            result.message = "아이디가 입력 양식에 맞지 않음"
            return res.status(400).send(result)
        }
        if(!pwPattern.test(pw)){
            result.message = "비밀번호가 입력 양식에 맞지 않음"
            return res.status(400).send(result)
        }
        if(!phonePattern.test(phone)){
            result.message = "전화번호가 입력 양식에 맞지 않음"
            return res.status(400).send(result)
        }
        if(!emailPattern.test(email)){
            result.success = false
            result.message = "이메일이 입력 양식에 맞지 않음"
            return res.status(400).send(result)
        }
        if(!birthPattern.test(birth)){
            result.success = false
            result.message = "생년월일이 입력 양식에 맞지 않음"
            return res.status(400).send(result)
        }
        if(!namePattern.test(name)){
            result.success = false
            result.message = "이름이 입력 양식에 맞지 않음"
            return res.status(400).send(result)
        }
        if(!pw_same || pw_same !== pw){
            result.success = false
            result.message = "비밀번호가 일치하지 않음"
            return res.status(400).send(result)
        }
        if(idDuplication){
            result.success = false
            result.message = "아이디가 중복됨"
            return res.status(400).send(result)
        }
        if(emailDuplication){
            result.success = false
            result.message = "이메일이 중복됨"
            return res.status(400).send(result)
        }
        result.message = "회원가입 성공"
        result.data = {
            "id" : id,
            "email" : email,
            "name" : name,
            "birth" : birth
        }
        res.status(200).send(result)
    } catch (error){
        result.message = "오류 발생"
        res.status(500).send(result)
    }
})

//로그아웃
app.post("/account/logout", (req,res) => {
    const result = {
        "message" : "" // 메시지
    }
    try{
        if(!req.session.isLogin){
            result.message = "로그인되어 있지 않음"
            return res.status(401).send(result)
        }
        result.message = "로그아웃 성공"
        req.session.destroy() // 세션 삭제
        res.status(200).send(result)
    } catch (error){
        result.message = "오류 발생"
        res.status(500).send(result)
    }
})

//id 찾기
app.get("/account/findid", (req,res) => {
    const { name, email } = req.body

    const emailPattern = /^[0-9a-zA-Z._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
    const namePattern = /^[가-힣]{2,5}$/
    const isUser = false // 해당하는 계정이 있는지

    const result = {
        "message" : "", // 메시지
        "data" : null // 사용자 정보
    }
    try{
        if(!emailPattern.test(email)){
            result.message = "이메일이 입력 양식에 맞지 않음"
            return res.status(400).send(result)
        }
        const trimName = name.trim()
        if(!namePattern.test(trimName)){
            result.message = "이름이 입력 양식에 맞지 않음"
            return res.status(400).send(result)
        }
        
        if(!isUser){
            result.message = "해당하는 계정이 없음"
            return res.status(404).send(result)
        }
        result.message = "id 찾기 성공"
        result.data = {
            "id" : id
        }
        res.status(200).send(result)
    } catch (error){
        result.message = "오류 발생"
        res.status(500).send(result)
    }
})

//pw 찾기
app.get("/account/findpw", (req,res) => {
    const { id, email } = req.body

    const idPattern = /^[a-zA-Z0-9]{4,20}$/
    const email_pattern = /^[0-9a-zA-Z._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/ 
    const isUser = false // 해당하는 계정이 있는지

    const result = {
        "message" : "", // 메시지
        "data" : null // 사용자 정보
    }
    try{
        if(!email_pattern.test(email)){
            result.message = "이메일이 입력 양식에 맞지 않음"
            return res.status(400).send(result)
        }
        const trimId = id.trim()
        if(!idPattern.test(trimId)){
            result.message = "아이디가 입력 양식에 맞지 않음"
            return res.status(400).send(result)
        }
        if(!isUser){
            result.message = "해당하는 계정이 없음"
            return res.status(404).send(result)
        }
        result.message = "pw 찾기 성공"
        result.data = {
            "pw" : pw
        }
        res.status(200).send(result)
    } catch (error){
        result.message = "오류 발생"
        res.status(500).send(result)
    }
})

//내 정보 보기 
app.get("/account", (req,res) => {
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
            result.message = "로그인 되어 있지 않음"
            return res.status(401).send(result)
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
        result.message = "오류 발생"
        res.status(500).send(result)
    }
})

//내 정보 수정하기
app.put("/account", (req,res) => {
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
            result.message = "로그인 되어 있지 않음"
            return res.status(401).send(result)
        }
        if(!pwPattern.test(pw)){
            result.message = "비밀번호가 입력 양식에 맞지 않음"
            return res.status(400).send(result)
        }
        if(!phonePattern.test(phone)){
            result.message = "전화번호가 입력 양식에 맞지 않음"
            return res.status(400).send(result)
        }
        if(!emailPattern.test(email)){
            result.message = "이메일이 입력 양식에 맞지 않음"
            return res.status(400).send(result)
        }
        if(!birthPattern.test(birth)){
            result.message = "생년월일이 입력 양식에 맞지 않음"
            return res.status(400).send(result)
        }
        if(!namePattern.test(name)){
            result.message = "이름이 입력 양식에 맞지 않음"
            return res.status(400).send(result)
        }
        result.message = "내 정보 수정 성공"
        result.data = { // 새로 입력한 정보를 보내줌
            "userKey" : userKey, 
            "id" : id,
            "email" : email,
            "name" : name
        }
        res.status(200).send(result)
    } catch (error){
        result.message = "오류 발생"
        res.status(500).send(result)
    }
})

//회원 탈퇴하기
app.delete("/account", (req,res) => {
    const isLogin = req.session.isLogin

    const result = {
        "message" : "" // 메시지
    }
    try{
        if(!isLogin){
            result.message = "로그인 되어 있지 않음"
            return res.status(401).send(result)
        }
        result.message = "회원 탈퇴 성공"
        req.session.destroy() //로그아웃
        res.status(200).send(result)
    } catch (error){
        result.message = "오류 발생"
        res.status(500).send(result)
    }
})

//게시물 쓰기
app.post("/posting", (req,res) => {
    const { content, title } = req.body

    const result = {
        "message" : "", // 메시지
        "data" : null // 게시물 정보
    }
    try{
        if(!content.trim()){
            result.message = "내용이 공백임"
            return res.status(400).send(result)
        }
        
        if(!title.trim()){
            result.message = "제목이 공백임"
            return res.status(400).send(result)
        }
        result.message = "게시물 쓰기 성공"
        result.data = {
            "postingKey" : postingKey,
            "id" : id,
            "content" : content,
            "title" : title
        }
        res.status(200).send(result)
    } catch (error){
        result.success = false
        result.message = "오류 발생"
        res.status(500).send(result)
    }
})

//전체 게시물 읽기
app.get("/posting", (req,res) => {
    const result = {
        "message" : "", // 메시지
        "data" : null // 게시물 정보
    }
    try{
        result.message = "전체 게시물 읽기 성공"
        res.status(200).send(result)
    } catch (error){
        result.message = "오류 발생"
        res.status(500).send(result)
    }
})

//각 게시물&댓글 읽기
app.get("/posting/:idx", (req,res) => { // 그냥 idx만 적어도 됨(postingKey말고) 언더바도 괜찮
    const isLogin = req.session.isLogin
    const postingKey = req.params.idx
    const isPosting = false

    const result = {
        "message" : "", // 메시지
        "data" : null // 댓글 정보
    }
    try{
        if(!isLogin){
            result.message = "로그인 되어 있지 않음"
            return res.status(401).send(result)
        }
        if(!postingKey || postingKey.trim() == "" || postingKey == undefined){
            result.message = "받아온 게시물 키가 비어있음"
            return res.status(400).send(result)
        }
        if(!isPosting){
            result.message = "게시물이 존재하지 않음"
            return res.status(404).send(result)
        }
        result.message = "전체 게시물과 댓글 읽기 성공"
        result.data = {
            "commentKey" : commentKey,
            "postingKey" : postingKey,
            "postingUser" : postingUserId,
            "postingContent" : postingContent,
            "postingTitle" : postingTitle,
            "postingView" : postingViewCount,
            "postingDate" : postingDate,
            "commentUser" : commentUserId,
            "commentContent" : commentContent,
            "commentDate" : commentDate,
        }
        res.status(200).send(result)
    } catch (error){
        result.message = "오류 발생"
        res.status(500).send(result)
    }
})

//게시물 수정
app.put("/posting/:idx", (req,res) => {
    const { content, title } = req.body
    const postingKey = req.params.idx
    const isLogin = req.session.isLogin
    const sessionKey = req.session.userKey
    const isPosting = false // 게시물이 있는지

    const result = {
        "message" : "", // 메시지
        "data" : null // 게시물 정보
    }
    try{
        if(!isLogin){
            result.message = "로그인 되어 있지 않음"
            return res.status(401).send(result)
        }
        if(!postingKey || postingKey.trim() == "" || postingKey == undefined){
            result.message = "받아온 게시물 키가 비어있음"
            return res.status(400).send(result)
        }
        if(!isPosting){
            result.message = "게시물이 존재하지 않음"
            return res.status(404).send(result)
        }
        if(userKey!=sessionKey){
            result.message = "게시글 작성자만 수정 가능함"
            return res.status(403).send(result)
        }
        if(!content.trim()){
            result.message = "내용이 공백임"
            return res.status(400).send(result)
        }
        if(!title.trim()){
            result.message = "제목이 공백임"
            return res.status(400).send(result)
        }
        result.message = "게시물 수정 성공"
        result.data = {
            "postingKey" : postingKey,
            "content" : content,
            "title" : title
        }
        res.status(200).send(result)
    } catch (error){
        result.message = "오류 발생"
        res.status(500).send(result)
    }
})

//게시물 삭제
app.delete("/posting/:idx", (req,res) => {
    const postingKey = req.params.idx
    const isLogin = req.session.isLogin
    const sessionKey = req.session.userKey
    const isPosting = false 

    const result = {
        "message" : "" // 메시지
    }
    try{
        if(!isLogin){
            result.message = "로그인 되어 있지 않음"
            return res.status(401).send(result)
        }
        if(!postingKey || postingKey.trim()=="" || postingKey == undefined){
            result.message = "받아온 게시물 키가 비어있음"
            return res.status(400).send(result)
        }
        if(!isPosting){
            result.message = "게시물이 존재하지 않음"
            return res.status(404).send(result)
        }
        if(userKey!=sessionKey){
            result.message = "게시글 작성자만 삭제 가능함"
            return res.status(403).send(result)
        }
        result.success = true
        result.message = "게시물 삭제 성공"
        res.status(200).send(result)
    } catch (error){
        result.message = "오류 발생"
        res.status(500).send(result)
    }
})

//댓글 쓰기
app.post("/comment", (req,res) => {
    const { postingKey, content } = req.body
    const isLogin = req.session.isLogin

    const result = {
        "message" : "", // 메시지
        "data" : null // 댓글 정보
    }
    try{
        if(!isLogin){
            result.message = "로그인 되어 있지 않음"
            return res.status(401).send(result)
        }
        if(!content.trim()){
            result.message = "내용이 공백임"
            return res.status(400).send(result)
        }
        result.message = "댓글 쓰기 성공"
        result.data = {
            "commentKey" : commentKey,
            "postingKey" : postingKey,
            "id" : id,
            "content" : content
        }
        res.status(200).send(result)
    } catch (error){
        result.message = "오류 발생"
        res.status(500).send(result)
    }
})

//댓글 수정
app.get("/comment:/idx", (req,res) => {
    const {content} = req.body
    const commentKey = req.params.idx
    const isLogin = req.session.isLogin
    const sessionKey = req.session.userKey
    const isComment = false

    const result = {
        "message" : "", // 메시지
        "data" : null // 댓글 정보
    }
    try{
        if(!isLogin){
            result.message = "로그인 되어 있지 않음"
            return res.status(401).send(result)
        }
        if(!commentKey || commentKey.trim()=="" || commentKey == undefined){
            result.message = "받아온 댓글 키가 비어있음"
            return res.status(400).send(result)
        }
        if(!isComment){
            result.message = "댓글이 존재하지 않음"
            return res.status(404).send(result)
        }
        if(userKey!=sessionKey){
            result.message = "댓글 작성자만 수정 가능함"
            return res.status(403).send(result)
        }
        if(!content){
            result.message = "내용이 공백임"
            return res.status(400).send(result)
        }
        result.message = "댓글 수정 성공"
        result.data = {
            "commentKey" : commentKey,
            "postingKey" : postingKey,
            "id" : id,
            "content" : content
        }
        res.status(200).send(result)
    } catch (error){
        result.message = "오류 발생"
        res.status(500).send(result)
    }
})

//댓글 삭제 
app.delete("/comment:/idx", (req,res) => {
    const commentKey = req.params.idx
    const isLogin = req.session.isLogin
    const sessionKey = req.session.userKey
    const isComment = false

    const result = {
        "message" : "", // 메시지
        "data" : null // 댓글 정보
    }
    try{
        if(!isLogin){
            result.message = "로그인 되어 있지 않음"
            return res.status(401).send(result)
        }
        if(!commentKey || commentKey.trim()=="" || commentKey == undefined){
            result.message = "받아온 댓글 키가 비어있음"
            return res.status(400).send(result)
        }
        if(!isComment){
            result.message = "댓글이 존재하지 않음"
            return res.status(404).send(result)
        }
        if(userKey!=sessionKey){
            result.message = "댓글 작성자만 삭제 가능함"
            return res.status(403).send(result)
        }
        result.message = "댓글 삭제 성공"
        res.status(200).send(result)
    } catch (error){
        result.message = "오류 발생"
        res.status(500).send(result)
    }
})

app.listen(port, () => {
    console.log(`${port}번에서 HTTP 웹서버 실행`)
})