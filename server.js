const express = require("express")

const app = express()
const port = 8001

//회원가입
app.post("/account", (req,res) => {
    const { id, pw, phone, name, email, birth } = req.body

    const result = {
        "success" : false, // 성공여부
        "message" : "", // 메시지
        "data" : null // 사용자 정보
    }

    //성공시
    result.success = true
    result.message = "회원가입 성공"
    result.data = {
        "user_key" : user_key,
        "id" : id,
        "email" : email,
        "name" : name
    }

    res.send(result)
})

//로그인
app.post("/login", (req,res) => {
    const { id, pw } = req.body

    const result = {
        "success" : false, // 성공여부
        "message" : "", // 메시지
        "data" : null // 사용자 정보
    }

    //성공시
    result.success = true
    result.message = "로그인 성공"
    result.data = {
        "user_key" : user_key,
        "id" : id,
        "email" : email,
        "name" : name
    }

    //실패시
    result.success = false
    result.message = "로그인 실패"
    
    res.send(result)
})

//로그아웃
app.post("/logout", (req,res) => {
    const { user_key } = req.body

    const result = {
        "success" : false, // 성공여부
        "message" : "" // 메시지
    }

    //성공시
    result.success = true
    result.message = "로그아웃 성공"

    //실패시
    result.success = false
    result.message = "로그인 실패"
    
    res.send(result)
})

//id 찾기
app.post("/findId", (req,res) => {
    const { name, email } = req.body

    const result = {
        "success" : false, // 성공여부
        "message" : "", // 메시지
        "data" : null // 사용자 정보
    }

    //성공시
    result.success = true
    result.message = "id 찾기 성공"
    result.data = {
        "id" : id
    }

    //실패시
    result.success = false
    result.message = "id 찾기 실패"
    
    res.send(result)
})

//pw 찾기
app.post("/findId", (req,res) => {
    const { id, email } = req.body

    const result = {
        "success" : false, // 성공여부
        "message" : "", // 메시지
        "data" : null // 사용자 정보
    }

    //성공시
    result.success = true
    result.message = "pw 찾기 성공"
    result.data = {
        "pw" : pw
    }

    //실패시
    result.success = false
    result.message = "pw 찾기 실패"
    
    res.send(result)
})

//내 정보 보기 
app.get("/account", (req,res) => {
    const { user_key } = req.body

    const result = {
        "success" : false, // 성공여부
        "message" : "", // 메시지
        "data" : null // 사용자 정보
    }

    //성공시
    result.success = true
    result.message = "내 정보 보기 성공"
    result.data = {
        "user_key" : user_key,
        "id" : id,
        "email" : email,
        "name" : name,
    }

    //실패시
    result.success = false
    result.message = "내 정보 보기 실패"
    
    res.send(result)
})

//내 정보 수정하기
app.put("/account", (req,res) => {
    const { email, name, phone, pw  } = req.body

    const result = {
        "success" : false, // 성공여부
        "message" : "", // 메시지
        "data" : null // 사용자 정보
    }

    //성공시
    result.success = true
    result.message = "내 정보 수정 성공"
    result.data = {
        "user_key" : user_key,
        "id" : id,
        "email" : email,
        "name" : name,
    }

    //실패시
    result.success = false
    result.message = "내 정보 수정 실패"
    
    res.send(result)
})

//회원 탈퇴하기
app.delete("/account", (req,res) => {
    const { user_key } = req.body

    const result = {
        "success" : false, // 성공여부
        "message" : "" // 메시지
    }

    //성공시
    result.success = true
    result.message = "회원 탈퇴 성공"

    //실패시
    result.success = false
    result.message = "회원 탈퇴 실패"
    
    res.send(result)
})

//게시물 쓰기
app.post("/posting", (req,res) => {
    const { content, title, user_key } = req.body

    const result = {
        "success" : false, // 성공여부
        "message" : "", // 메시지
        "data" : null // 게시물 정보
    }

    //성공시
    result.success = true
    result.message = "게시물 쓰기 성공"
    result.data = {
        "posting_key" : posting_key,
        "id" : id,
        "content" : content,
        "title" : title
    }

    //실패시
    result.success = false
    result.message = "게시물 쓰기 실패"
    
    res.send(result)
})

//게시물 읽기
app.get("/posting", (req,res) => {
    const { posting_key } = req.body

    const result = {
        "success" : false, // 성공여부
        "message" : "", // 메시지
        "data" : null // 게시물 정보
    }

    //성공시
    result.success = true
    result.message = "게시물 읽기 성공"
    result.data = {
        "posting_key" : posting_key,
        "id" : id,
        "content" : content,
        "title" : title,
        "view_count" : view_count,
        "date" : date
    }

    //실패시
    result.success = false
    result.message = "게시물 읽기 실패"
    
    res.send(result)
})

//게시물 수정
app.put("/posting", (req,res) => {
    const { posting_key, content, title, user_key } = req.body

    const result = {
        "success" : false, // 성공여부
        "message" : "", // 메시지
        "data" : null // 게시물 정보
    }

    //성공시
    result.success = true
    result.message = "게시물 수정 성공"
    result.data = {
        "posting_key" : posting_key,
        "content" : content,
        "title" : title
    }

    //실패시
    result.success = false
    result.message = "게시물 수정 실패"
    
    res.send(result)
})

//게시물 삭제
app.delete("/posting", (req,res) => {
    const { posting_key, user_key } = req.body

    const result = {
        "success" : false, // 성공여부
        "message" : "" // 메시지
    }

    //성공시
    result.success = true
    result.message = "게시물 삭제 성공"

    //실패시
    result.success = false
    result.message = "게시물 삭제 실패."
    
    res.send(result)
})

//댓글 쓰기
app.post("/comment", (req,res) => {
    const { posting_key, user_key, content } = req.body

    const result = {
        "success" : false, // 성공여부
        "message" : "", // 메시지
        "data" : null // 댓글 정보
    }

    //성공시
    result.success = true
    result.message = "댓글 쓰기 성공"
    result.data = {
        "comment_key" : comment_key,
        "posting_key" : posting_key,
        "id" : id,
        "content" : content
    }

    //실패시
    result.success = false
    result.message = "댓글 쓰기 실패."
    
    res.send(result)
})

//댓글 읽기
app.get("/comment", (req,res) => {
    const { comment_key } = req.body

    const result = {
        "success" : false, // 성공여부
        "message" : "", // 메시지
        "data" : null // 댓글 정보
    }

    //성공시
    result.success = true
    result.message = "댓글 읽기 성공"
    result.data = {
        "comment_key" : comment_key,
        "posting_key" : posting_key,
        "id" : id,
        "content" : content,
        "date" : date
    }

    //실패시
    result.success = false
    result.message = "댓글 읽기 실패"
    
    res.send(result)
})

//댓글 수정
app.get("/comment", (req,res) => {
    const { comment_key, user_key, content, title } = req.body

    const result = {
        "success" : false, // 성공여부
        "message" : "", // 메시지
        "data" : null // 댓글 정보
    }

    //성공시
    result.success = true
    result.message = "댓글 수정 성공"
    result.data = {
        "comment_key" : comment_key,
        "posting_key" : posting_key,
        "id" : id,
        "content" : content
    }

    //실패시
    result.success = false
    result.message = "댓글 수정 실패"
    
    res.send(result)
})

//댓글 삭제
app.delete("/comment", (req,res) => {
    const { comment_key, user_key } = req.body

    const result = {
        "success" : false, // 성공여부
        "message" : "" // 메시지
    }

    //성공시
    result.success = true
    result.message = "댓글 삭제 성공"

    //실패시
    result.success = false
    result.message = "댓글 삭제 실패"
    
    res.send(result)
})

app.listen(port, () => {
    console.log(`${port}번에서 HTTP 웹서버 실행`)
})