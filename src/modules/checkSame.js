const checkSame = (value1, value2, input) => { // 비밀번호 맞나 체크 // 좀 더 공용으로 사용할 수 있게 이름 바꾸자 매개변수도 
    if (!value2 || value2 !== value1) {
        const error = new Error(`${input}이(가) 일치하지 않음`)
        error.status = 400
        throw error
    }
}

module.exports = checkSame