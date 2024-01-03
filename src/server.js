const express = require("express")
const session = require("express-session") // 세션const app = express()
const path = require("path")
const https = require("https")

const app = express()
const port = 8000
const httpsPort = 8443 // 포트 번호 추가

app.use(session({
    secret: 'myKey', // 세션을 암호화하는 데 사용됨
    resave: false, // 계속 새로 발급하지 않음
    saveUninitialized: true, // 세션 사용하기 전까지 미발급
}))

app.use(express.json())

app.get("*", (req, res, next) => {
    const protocol = req.protocol
    if (protocol === "http") {
        const dest = `https://${req.hostname}:8443${req.url}`
        // res.redirect
        //     (dest)
    }
    next()
})

const accountApi = require("./routers/account")
app.use("/account", accountApi)

const postingApi = require("./routers/posting")
app.use("/posting", postingApi)

const commentApi = require("./routers/comment")
app.use("/comment", commentApi)

const logger = require("./middleware/logger")
app.use(logger)

app.use((err, req, res, next) => { // 에러 처리
    res.status(err.status || 500).send({
        message: err.message || "오류 발생"
    })
})

app.listen(port, () => {
    console.log(`${port}번에서 HTTP 웹서버 실행`)
})