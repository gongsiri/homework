const router = require("express").Router()

//댓글 쓰기
router.post("/", (req,res) => {
    const { postingKey, content } = req.body
    const isLogin = req.session.isLogin

    const result = {
        "message" : "", // 메시지
        "data" : null // 댓글 정보
    }
    try{ㄴ
        if(!isLogin){
            const error = new Error("이미 로그인 되어 있음")
            error.status = 401
            throw error
        }
        if(!content.trim()){
            const error = new Error("내용이 공백임")
            error.status = 400
            throw error
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
        result.message = error.message || "오류 발생"
        res.status(error.status || 500).send(result)
    }
})

//댓글 읽기
router.get("/:idx", (req,res) => {
    const isLogin = req.session.isLogin
    const postingKey = req.params.idx
    const isPosting = false

    const result = {
        "message" : "", // 메시지
        "data" : null // 댓글 정보
    }
    try{
        if(!isLogin){
            const error = new Error("이미 로그인 되어 있음")
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
        result.message = "댓글 읽기 성공"
        result.data = {
            "commentKey" : commentKey,
            "commentUser" : commentUserId,
            "commentContent" : commentContent,
            "commentDate" : commentDate,
        }
        res.status(200).send(result)
    } catch (error){
        result.message = error.message || "오류 발생"
        res.status(error.status || 500).send(result)
    }
})

//댓글 수정
router.put(":/idx", (req,res) => {
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
            const error = new Error("이미 로그인 되어 있음")
            error.status = 401
            throw error
        }
        if(!commentKey || commentKey.trim()=="" || commentKey == undefined){
            const error = new Error("받아온 댓글 키가 비어있음")
            error.status = 400
            throw error
        }
        if(!isComment){
            const error = new Error("댓글이 존재하지 않음")
            error.status = 404
            throw error
        }
        if(userKey!=sessionKey){
            const error = new Error("댓글 작성자만 수정 가능함")
            error.status = 403
            throw error
        }
        if(!content){
            const error = new Error("내용이 공백임")
            error.status = 400
            throw error
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
        result.message = error.message || "오류 발생"
        res.status(error.status || 500).send(result)
    }
})

//댓글 삭제 
router.delete(":/idx", (req,res) => {
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
            const error = new Error("이미 로그인 되어 있음")
            error.status = 401
            throw error
        }
        if(!commentKey || commentKey.trim()=="" || commentKey == undefined){
            const error = new Error("받아온 댓글 키가 비어있음")
            error.status = 400
            throw error
        }
        if(!isComment){
            const error = new Error("댓글이 존재하지 않음")
            error.status = 404
            throw error
        }
        if(userKey!=sessionKey){
            const error = new Error("댓글 작성자만 삭제 가능함")
            error.status = 403
            throw error
        }
        result.message = "댓글 삭제 성공"
        res.status(200).send(result)
    } catch (error){
        result.message = error.message || "오류 발생"
        res.status(error.status || 500).send(result)
    }
})

module.exports = router