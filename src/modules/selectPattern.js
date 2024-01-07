// module 말고 config에 넣는 게 좋음 
const idPattern = /^[a-zA-Z0-9]{4,20}$/
const pwPattern = /^(?=.*[a-zA-Z])(?=.*[!@#$%^*+=-])(?=.*[0-9]).{8,30}$/
const namePattern = /^[가-힣]{2,5}$/
const phonePattern = /^01[0179][0-9]{7,8}$/
const emailPattern = /^[0-9a-zA-Z._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
const birthPattern = /^(19|20)[0-9]{2}(0[1-9]|1[0-2])(0[1-9]|[1-2][0-9]|3[0-1])$/

module.exports = { idPattern, pwPattern, namePattern, phonePattern, emailPattern, birthPattern }