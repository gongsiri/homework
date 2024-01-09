const express = require("express")
const session = require("express-session") // 세션const app = express()
const cp = require("cookie-parser")
const sessionConfig = require("./config/sessionConfig")
const accountApi = require("./routers/account")
const postingApi = require("./routers/posting")
const commentApi = require("./routers/comment")
const logApi = require("./routers/log")
const logger = require("./config/loggerConfig")

const app = express()
const port = 8001

require("dotenv").config()
app.use(session(sessionConfig))
app.use(express.json())
app.use(cp())

app.use("/account", accountApi)
app.use("/posting", postingApi)
app.use("/comment", commentApi)
app.use("/log", logApi)

app.use((err, req, res, next) => { // 에러 처리
    logger(req, res, { stack: err.stack })
    res.status(err.status || 500).send({ message: err.message || "오류 발생" })
})

app.listen(port, () => {
    console.log(`${port}번에서 HTTP 웹서버 실행`)
})