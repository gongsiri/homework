const router = require("express").Router()

//게시물 쓰기
router.post("/", (req,res) => {
    const { content, title } = req.body

    const result = {
        "message" : "", // 메시지
        "data" : null // 게시물 정보
    }
    try{
        if(!content.trim()){
            const error = new Error("내용이 공백임")
            error.status = 400
            throw error
        }
        if(!title.trim()){
            const error = new Error("제목이 공백임")
            error.status = 400
            throw error
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
        result.message = error.message || "오류 발생"
        res.status(error.status || 500).send(result)
    }
})

//전체 게시물 읽기
router.get("/", (req,res) => {
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

//각 게시물 읽기
router.get("/:idx", (req,res) => { // 그냥 idx만 적어도 됨(postingKey말고) 언더바도 괜찮
    const isLogin = req.session.isLogin
    const postingKey = req.params.idx
    const isPosting = false

    const result = {
        "message" : "", // 메시지
        "data" : null // 댓글 정보
    }
    try{
        if(!isLogin){
            const error = new Error("로그인 되어 있지 않음")
            error.status = 401
            throw error
        }
        if(!postingKey || postingKey.trim() == "" || postingKey == undefined){
            const error = new Error("받아온 게시물 키가 비어있음")
            error.status = 400
            throw error
        }
        if(!isPosting){
            const error = new Error("게시물이 존재하지 않음")
            error.status = 404
            throw error
        }
        result.message = "전체 게시물 읽기 성공"
        result.data = {
            "postingKey" : postingKey,
            "postingUser" : postingUserId,
            "postingContent" : postingContent,
            "postingTitle" : postingTitle,
            "postingView" : postingViewCount,
            "postingDate" : postingDate,
        }
        res.status(200).send(result)
    } catch (error){
        result.message = error.message || "오류 발생"
        res.status(error.status || 500).send(result)
    }
})

//게시물 수정
router.put("/:idx", (req,res) => {
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
            const error = new Error("로그인 되어 있지 않음")
            error.status = 401
            throw error
        }
        if(!postingKey || postingKey.trim() == "" || postingKey == undefined){
            const error = new Error("받아온 게시물 키가 비어있음")
            error.status = 400
            throw error
        }
        if(!isPosting){
            const error = new Error("게시물이 존재하지 않음")
            error.status = 404
            throw error
        }
        if(userKey!=sessionKey){
            const error = new Error("게시글 작성자만 수정 가능함")
            error.status = 403
            throw error
        }
        if(!content.trim()){
            const error = new Error("내용이 공백임")
            error.status = 400
            throw error
        }
        if(!title.trim()){
            const error = new Error("제목이 공백임")
            error.status = 400
            throw error
        }
        result.message = "게시물 수정 성공"
        result.data = {
            "postingKey" : postingKey,
            "content" : content,
            "title" : title
        }
        res.status(200).send(result)
    } catch (error){
        result.message = error.message || "오류 발생"
        res.status(error.status || 500).send(result)
    }
})

//게시물 삭제
router.delete("/:idx", (req,res) => {
    const postingKey = req.params.idx
    const isLogin = req.session.isLogin
    const sessionKey = req.session.userKey
    const isPosting = false 

    const result = {
        "message" : "" // 메시지
    }
    try{
        if(!isLogin){
            const error = new Error("로그인 되어 있지 않음")
            error.status = 401
            throw error
        }
        if(!postingKey || postingKey.trim()=="" || postingKey == undefined){
            const error = new Error("받아온 게시물 키가 비어있음")
            error.status = 400
            throw error
        }
        if(!isPosting){
            const error = new Error("게시물이 존재하지 않음")
            error.status = 404
            throw error
        }
        if(userKey!=sessionKey){
            const error = new Error("게시글 작성자만 삭제 가능함")
            error.status = 403
            throw error
        }
        result.success = true
        result.message = "게시물 삭제 성공"
        res.status(200).send(result)
    } catch (error){
        result.message = error.message || "오류 발생"
        res.status(error.status || 500).send(result)
    }
})

module.exports = router