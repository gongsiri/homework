const express = require("express")
const session = require("express-session") // 세션const app = express()
const path = require("path")
const https = require("https")

const accountApi = require("./routers/account")
const postingApi = require("./routers/posting")
const commentApi = require("./routers/comment")
const logApi = require("./routers/log")

const app = express()
const port = 8001
const httpsPort = 8443 // 포트 번호 추가

app.use(session({ // config로 만들기
    secret: 'myKey', // 세션을 암호화하는 데 사용됨
    resave: false, // 계속 새로 발급하지 않음
    saveUninitialized: true, // 세션 사용하기 전까지 미발급
}))
app.use(express.json())

app.use("/account", accountApi)
app.use("/posting", postingApi)
app.use("/comment", commentApi)
app.use("/log", logApi)

app.use((err, req, res, next) => { // 에러 처리
    // 에러 로깅 한줄 끝
    res.status(err.status || 500).send({
        message: err.message || "오류 발생"
    })
})

app.listen(port, () => {
    console.log(`${port}번에서 HTTP 웹서버 실행`)
})