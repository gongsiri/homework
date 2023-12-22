const checkCondition = (value, pattern, input) => { // 양식에 맞나 체크
    if (!pattern.test(value)) {
        const error = new Error(`${input}이(가) 입력 양식에 맞지 않음`)
        error.status = 400
        throw error
    }
}
const checkPwMatch = (pw, pw_same) => { // 비밀번호 맞나 체크
    if (!pw_same || pw_same !== pw) {
        const error = new Error("비밀번호가 일치하지 않음")
        error.status = 400
        throw error
    }
}
const checkLogin = (req, res, next) => { // 로그인 되어 있는 상태인지 체크
    if (req.session.isLogin) {
        const error = new Error("이미 로그인 되어 있음")
        error.status = 401
        return next(error)
    }
    next()
}
const checkLogout = (req, res, next) => { // 로그인 되어 있지 않은 상태인지 체크
    if (!req.session.isLogin) {
        const error = new Error("로그인 되어 있지 않음")
        error.status = 401
        return next(error)
    }
    next()
}

module.exports.checkCondition = checkCondition
module.exports.checkPwMatch = checkPwMatch
module.exports.checkLogin = checkLogin
module.exports.checkLogout = checkLogout
