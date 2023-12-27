const checkKey = (value, input) => {
    if (!value || value.trim() == "" || value == undefined) {
        const error = new Error(`받아온 ${input}키가 공백임`)
        error.status = 400
        throw error
    }
}

module.exports = checkKey