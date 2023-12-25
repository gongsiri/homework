const checkCondition = (value, input) => { // 양식에 맞나 체크
    const pattern = selectPattern(input)
    console.log(pattern)
    if (!pattern.test(value)) {
        const error = new Error(`${input}이(가) 입력 양식에 맞지 않음`)
        error.status = 400
        throw error
    }
}
const selectPattern = (input) => {
    if (input == "아이디") {
        return /^[a-zA-Z0-9]{4,20}$/
    }
    if (input == "비밀번호") {
        return /^(?=.*[a-zA-Z])(?=.*[!@#$%^*+=-])(?=.*[0-9]).{8,30}$/
    }
    if (input == "전화번호") {
        return /^01[0179][0-9]{7,8}$/
    }
    if (input == "이메일") {
        return /^[0-9a-zA-Z._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
    }
    if (input == "생년월일") {
        return /^(19|20)[0-9]{2}(0[1-9]|1[0-2])(0[1-9]|[1-2][0-9]|3[0-1])$/
    }
    if (input == "이름") {
        return /^[가-힣]{2,5}$/
    }
}

module.exports = checkCondition