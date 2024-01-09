const jwt = require("jsonwebtoken")

const isLogin = (req, res, next) => {
    const token = req.cookies.token
    try {
        if (!token) {
            throw new Error("no token")
        }
        jwt.verify(token, process.env.SECRET_KEY)
        next()
    } catch (error) {
        const result = {
            "success": false,
            "message": ""
        }

        if (error.message === "no token") {
            result.message = "토큰이 없음"
        } else if (error.message === "jwt expired") {
            result.message = "토큰이 끝남"
        } else if (error.message === "invalid token") {
            result.message = "토큰이 조작됨"
        } else {
            result.message = "오류 발생"
        }
        res.send(result)
    }
}

module.exports = isLogin