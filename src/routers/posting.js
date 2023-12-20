const router = require("express").Router()
const connectMysql = require("../../database/connect/maria")

//게시물 쓰기
router.post("/", async (req,res,next) => {
    const isLogin = req.session.isLogin
    const { content, title } = req.body
    const result = {
        "message" : "", // 메시지
        "data" : null // 게시물 정보
    }
    let connect
    try{
        if(!isLogin){
            const error = new Error("로그인 되어 있지 않음")
            error.status = 401
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
        connect = await connectMysql()
        const sql = 'INSERT INTO posting (user_key,title,content) VALUES (?,?,?)'
        const params = [req.session.userKey,title,content]
        await connect.execute(sql,params)
        result.message = "게시물 쓰기 성공"
        result.data = {
            "id" : req.session.userId,
            "content" : content,
            "title" : title
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

//전체 게시물 읽기
router.get("/",  async(req,res,next) => {
    const result = {
        "message" : "", // 메시지
        "data" : null // 게시물 정보
    }
    let connect
    try{
        connect = await connectMysql()
        const sql = "SELECT * FROM posting"
        const queryResult = await connect.execute(sql)
        console.log(queryResult)
        if(queryResult[0].length>0){
            const postingData = []
            for(let i=0; i< queryResult[0].length; i++){
                const posting = queryResult[0][i]
                const realData = {
                    posting_key: posting.posting_key,
                    user_key: posting.user_key,
                    date: posting.date,
                    title: posting.title,
                    content: posting.content,
                    view_count: posting.view_count
                }
                postingData.push(realData)
            }
            console.log(postingData)
            result.message = "전체 게시물 읽기 성공"
            result.data = postingData
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

//각 게시물 읽기
router.get("/:idx", async (req,res) => { // 그냥 idx만 적어도 됨(postingKey말고) 언더바도 괜찮
    const isLogin = req.session.isLogin
    const postingKey = req.params.idx

    const result = {
        "message" : "", // 메시지
        "data" : null // 댓글 정보
    }
    let connect
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
        const sql = "SELECT * FROM posting WHERE posting_key =?"
        const params = [postingKey]
        const queryResult = await connect.execute(sql,params)

        if(queryResult[0].length>0){
            const postingUser = queryResult[0][0].user_key
            const postingContent = queryResult[0][0].content
            const postingTitle = queryResult[0][0].title
            const postingView = queryResult[0][0].view_count
            const postingData = queryResult[0][0].date
    
            result.message = "각 게시물 읽기 성공"
            result.data = {
                "postingKey" : postingKey,
                "postingUser" : postingUser,
                "postingContent" : postingContent,
                "postingTitle" : postingTitle,
                "postingView" : postingView,
                "postingDate" : postingData,
            }
            res.status(200).send(result)
        } else{
            const error = new Error("게시물이 존재하지 않음")
            error.status = 404
            throw error
        }
    } catch (error){
        result.message = error.message || "오류 발생"
        res.status(error.status || 500).send(result)
    } finally {
        if(connect){
            connect.end()
        }
    }
})

//게시물 수정
router.put("/:idx", async (req,res,next) => {
    const { content, title } = req.body
    const postingKey = req.params.idx
    const isLogin = req.session.isLogin
    const sessionKey = req.session.userKey
    let connect
    let userKey

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

        connect = await connectMysql()
        const sql = "SELECT * FROM posting WHERE posting_key =?"
        const params = [postingKey]
        const queryResult = await connect.execute(sql,params)
        if(queryResult[0].length>0){
            userKey = queryResult[0][0].user_key
            console.log(userKey)
        } else{
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

        const updateSql = "UPDATE posting SET content=?, title=? WHERE posting_key=?"
        const updateParams = [content,title,postingKey]
        await connect.execute(updateSql, updateParams)

        result.message = "게시물 수정 성공"
        result.data = {
            "postingKey" : postingKey,
            "content" : content,
            "title" : title
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

//게시물 삭제
router.delete("/:idx", async(req,res,next) => {
    const postingKey = req.params.idx
    const isLogin = req.session.isLogin
    const sessionKey = req.session.userKey
    let connect
    let userKey

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

        connect = await connectMysql()
        const sql = "SELECT * FROM posting WHERE posting_key =?"
        const params = [postingKey]
        const queryResult = await connect.execute(sql,params)
        if(queryResult[0].length>0){
            userKey = queryResult[0][0].user_key
        } else{
            const error = new Error("게시물이 존재하지 않음")
            error.status = 404
            throw error
        }
        if(userKey!=sessionKey){
            const error = new Error("게시글 작성자만 삭제 가능함")
            error.status = 403
            throw error
        }
        
        const deleteSql = "DELETE FROM posting WHERE posting_key= ?"
        const deleteParams = [postingKey]
        await connect.execute(deleteSql,deleteParams)
        result.message = "게시물 삭제 성공"
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