const maria = require("mysql")

const conn = maria.createConnection({
    host : '13.125.242.140',
    port : 8001,
    user : "gongsil",
    password : "1005",
    database : "week06"
})

module.exports = conn