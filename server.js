const express = require("express")
const session = require("express-session") // 세션const app = express()
const app = express()
const port = 8001

app.use(session({
    secret : 'session', // 세션을 암호화하는 데 사용됨
    resave : false, // 계속 새로 발급하지 않음
    saveUninitialized : true, // 세션 사용하기 전까지 미발급
}))

app.use(express.json())

const accountApi = require("./src/routers/account")
app.use("/account",accountApi)

const postingApi = require("./src/routers/posting")
app.use("/posting",postingApi)

const commentApi = require("./src/routers/comment")
app.use("/comment",commentApi)

app.listen(port, () => {
    console.log(`${port}번에서 HTTP 웹서버 실행`)
})