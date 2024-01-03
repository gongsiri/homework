const logger = require("../middleware/logger")

const sendModule = (req, res, status, result) => {
    //로깅 시도
    console.log("로깅 시도")
    logger(req, res, status, result)
    res.status(status).send(result)
}

module.exports = sendModule