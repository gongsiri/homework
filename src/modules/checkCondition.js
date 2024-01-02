const idPattern = /^[a-zA-Z0-9]{4,20}$/
const pwPattern = /^(?=.*[a-zA-Z])(?=.*[!@#$%^*+=-])(?=.*[0-9]).{8,30}$/
const namePattern = /^[가-힣]{2,5}$/
const phonePattern = /^01[0179][0-9]{7,8}$/
const emailPattern = /^[0-9a-zA-Z._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
const birthPattern = /^(19|20)[0-9]{2}(0[1-9]|1[0-2])(0[1-9]|[1-2][0-9]|3[0-1])$/

const checkCondition = (value, input, pattern) => { // 양식에 맞나 체크
    if (!pattern.test(value)) {
        const error = new Error(`${input}이(가) 입력 양식에 맞지 않음`)
        error.status = 400
        throw error
    }
}

module.exports = checkCondition