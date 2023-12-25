const checkLogin = (req, res, next) => { // 로그인 되어 있는 상태인지 체크
    if (req.session.isLogin) {
        const error = new Error("이미 로그인 되어 있음")
        error.status = 401
        return next(error)
    }
    next()
}

module.exports = checkLogin