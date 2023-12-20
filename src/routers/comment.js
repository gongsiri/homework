const router = require("express").Router()
const connectMysql = require("../../database/connect/maria")

//댓글 쓰기
router.post("/:idx", async (req,res,next) => {
    const postingKey = req.params.idx
    const { content } = req.body
    const isLogin = req.session.isLogin
    let connect

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
        connect = await connectMysql()
        const postingExistQuery = "SELECT * FROM posting WHERE posting_key = ?";
        const postingExistParams = [postingKey];
        const postingExistResult = await connect.execute(postingExistQuery, postingExistParams);

        if (postingExistResult[0].length === 0) {
            const error = new Error("해당하는 게시물이 존재하지 않습니다.");
            error.status = 404;
            throw error;
        }

        if(!content.trim()){
            const error = new Error("내용이 공백임")
            error.status = 400
            throw error
        }

        const sql = 'INSERT INTO comment (user_key,posting_key,content) VALUES (?,?,?)'
        const params = [req.session.userKey,postingKey,content]
        await connect.execute(sql,params)

        result.message = "댓글 쓰기 성공"
        result.data = {
            "postingKey" : postingKey,
            "id" : req.session.userId,
            "content" : content
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

//댓글 읽기
router.get("/:idx", async (req,res,next) => {
    const isLogin = req.session.isLogin
    const postingKey = req.params.idx
    let connect

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
        connect = await connectMysql()
        const postingExistQuery = "SELECT * FROM posting WHERE posting_key = ?";
        const postingExistParams = [postingKey];
        const postingExistResult = await connect.execute(postingExistQuery, postingExistParams);

        if (postingExistResult[0].length === 0) {
            const error = new Error("해당하는 게시물이 존재하지 않습니다.");
            error.status = 404;
            throw error;
        }

        const sql = "SELECT * FROM comment WHERE posting_key=?"
        const params = [postingKey]
        const queryResult = await connect.execute(sql,params)
        if(queryResult[0].length>0){
            const commentData = []
            for(let i=0; i<queryResult[0].length; i++){
                const comment = queryResult[0][i]
                const realData = {
                    comment_key : comment.comment_key,
                    user_key : comment.user_key,
                    date : comment.date,
                    content : comment.content
                }
                commentData.push(realData)
            }
            result.message = "댓글 읽기 성공"
            result.data = commentData
            res.status(200).send(result)
        }
    } catch (error){
        next(error)
    } finally {
        if(connect){
            connect.end()
        }
    }
})

//댓글 수정
router.put("/:idx", async (req,res,next) => {
    const {content} = req.body
    const commentKey = req.params.idx
    const isLogin = req.session.isLogin
    const sessionKey = req.session.userKey
    let connect
    let userKey

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
        if(!commentKey || commentKey.trim()=="" || commentKey == undefined){
            const error = new Error("받아온 댓글 키가 비어있음")
            error.status = 400
            throw error
        }

        connect = await connectMysql()
        const commentExistQuery = "SELECT * FROM comment WHERE comment_key = ?"
        const commentExistParams = [commentKey]
        const commentExistResult = await connect.execute(commentExistQuery, commentExistParams)

        if (commentExistResult[0].length>0) {
            userKey = commentExistResult[0][0].user_key
        } else{
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

        const updateSql = "UPDATE comment SET content=? WHERE comment_key=?"
        const updateParams = [content,commentKey]
        await connect.execute(updateSql, updateParams)

        result.message = "댓글 수정 성공"
        result.data = {
            "commentKey" : commentKey,
            "userKey" : userKey,
            "content" : content
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

//댓글 삭제 
router.delete("/:idx", async (req,res,next) => {
    const commentKey = req.params.idx
    const isLogin = req.session.isLogin
    const sessionKey = req.session.userKey
    let connect
    let userKey

    const result = {
        "message" : "", // 메시지
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

        connect = await connectMysql()
        const sql = "SELECT * FROM comment WHERE comment_key =?"
        const params = [commentKey]
        const queryResult = await connect.execute(sql,params)
        if(queryResult[0].length>0){
            userKey = queryResult[0][0].user_key
        } else{
            const error = new Error("댓글이 존재하지 않음")
            error.status = 404
            throw error
        }
        if(userKey!=sessionKey){
            const error = new Error("댓글 작성자만 삭제 가능함")
            error.status = 403
            throw error
        }

        const deleteSql = "DELETE FROM comment WHERE comment_key= ?"
        const deleteParams = [commentKey]
        await connect.execute(deleteSql,deleteParams)
        result.message = "댓글 삭제 성공"
        res.status(200).send(result)
    } catch (error){
        next(error)
    } finally {
        if(connect){
            connect.end()
        }
    }
})

module.exports = router