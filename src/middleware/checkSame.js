const checkSame = (input1, input2) => { // 비밀번호 맞나 체크 // 좀 더 공용으로 사용할 수 있게 이름 바꾸자 매개변수도 
    return (req, res, next) => {
        try {
            const value1 = req.body[input1]
            const value2 = req.body[input2]
            console.log(value1)
            console.log(value2)

            if (!value2 || value2 !== value1) {
                const error = new Error(`${input1}이(가) 일치하지 않음`)
                error.status = 400
                throw error
            }
            next()
        } catch (error) {
            next(error)
        }
    }
}

module.exports = checkSame