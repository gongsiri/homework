const adminAuth = (req, res, next) => { // 로그인 되어 있는 상태인지 체크 // 이름을 바꾸자 (isLogin같은 걸로 바꾸자) (need...LoginAuth)
    if (!req.session.isAdmin) {
        const error = new Error("권한이 없습니다")
        error.status = 401
        return next(error)
    }
    next()
}

module.exports = adminAuth