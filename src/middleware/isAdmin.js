const jwt = require("jsonwebtoken")
const extractToken = require("../modules/extractToken")

const isAdmin = (req, res, next) => {
    const token = req.cookies.token
    if (!token) {
        throw new Error("no token")
    }

    try {
        jwt.verify(token, process.env.SECRET_KEY)
        if (!extractToken(token).isAdmin) {
            throw new Error("권한이 없습니다.")
        }
        next()
    } catch (error) {
        next(error)
    }
}

module.exports = isAdmin