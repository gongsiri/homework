const logger = require("../middleware/logger")

const sendModule = (req, res, status, result) => { // 상태코드, 결과 데이터 
    logger(req, res, status, result) // 요청과 응답에 대한 로그를 기록
    res.status(status).send(result) // 클라이언트에게 결과 데이터 전송
}

module.exports = sendModule