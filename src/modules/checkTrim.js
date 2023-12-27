const checkTrim = (value, input) => {
    if (!value.trim()) {
        const error = new Error(`${input}이 공백임`)
        error.status = 400
        throw error
    }
}

module.exports = checkTrim