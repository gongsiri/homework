const express = require("express")
const session = require("express-session") // 세션const app = express()
const sessionConfig = require("./config/sessionConfig")
const accountApi = require("./routers/account")
const postingApi = require("./routers/posting")
const commentApi = require("./routers/comment")
const logApi = require("./routers/log")

const app = express()
const port = 8001

app.use(session(sessionConfig()))
app.use(express.json())

app.use("/account", accountApi)
app.use("/posting", postingApi)
app.use("/comment", commentApi)
app.use("/log", logApi)

app.use((err, req, res, next) => { // 에러 처리
    res.status(err.status || 500).send({
        message: err.message || "오류 발생"
    })
})

app.listen(port, () => {
    console.log(`${port}번에서 HTTP 웹서버 실행`)
})