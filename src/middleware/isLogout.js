const isLogout = (req, res, next) => { // 로그아웃 상태인지 확인
    if (!req.session.isLogin) {
        const error = new Error("로그인 되어 있지 않음")
        error.status = 401
        return next(error)
    }
    next()
}

module.exports = isLogout