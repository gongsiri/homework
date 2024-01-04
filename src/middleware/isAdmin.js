const isAdmin = (req, res, next) => {
    if (!req.session.isAdmin) {
        const error = new Error("권한이 없습니다")
        error.status = 401
        return next(error)
    }
    next()
}

module.exports = isAdmin