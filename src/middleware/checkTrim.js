const checkTrim = (input) => {
    return (req, res, next) => {
        try {
            const value = req.body[input]
            if (!value || value.trim() == "" || value == undefined) {
                const error = new Error(`${input}이(가) 공백임`)
                error.status = 400
                throw error
            }
        } catch (error) {
            next(error)
        }
    }
}

module.exports = checkTrim