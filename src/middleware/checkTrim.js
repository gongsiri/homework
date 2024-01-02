const checkTrim = (input, inputType = "body") => {
    return (req, res, next) => {
        try {
            let value
            if (inputType === "params") {
                console.log(input)
                value = req.params[input]
                console.log(value)
            } else {
                value = req.body[input]
            }
            if (!value || value.trim() === "" || value == undefined) {
                const error = new Error(`${input}이(가) 공백임`)
                error.status = 400
                throw error
            }
            next()
        } catch (error) {
            next(error)
        }
    }
}

module.exports = checkTrim