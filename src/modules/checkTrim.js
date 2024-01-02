const checkTrim = (value, input) => {
    if (!value || value.trim() == "" || value == undefined) {
        const error = new Error(`${input}이(가) 공백임`)
        error.status = 400
        throw error
    }
}

module.exports = checkTrim