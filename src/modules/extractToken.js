const extractToken = (token) => {
    if (!token) {
        // token이 없는 경우 예외 처리 또는 기본값 설정 등을 수행할 수 있습니다.
        throw new Error("Token is undefined");
    }
    const payload = token.split(".")[1]
    const convert = Buffer.from(payload, "base64")
    const data = JSON.parse(convert.toString())
    return data
}
module.exports = extractToken




