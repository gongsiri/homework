const checkLogin = (req, res, next) => { // 로그인 되어 있는 상태인지 체크 // 이름을 바꾸자 (isLogin같은 걸로 바꾸자) (need...LoginAuth)
    if (req.session.isLogin) {
        const error = new Error("이미 로그인 되어 있음")
        error.status = 401
        return next(error)
    }
    next()
}

module.exports = checkLogin