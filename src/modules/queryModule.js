const connectPostgres = require("../../database/connect/postgres")

const queryModule = async (sql, params) => {
    let client
    try {
        const pool = await connectPostgres() // 연결 풀 가져오기
        client = await pool.connect() // 연결 풀에서 클라이언트 얻음
        const result = await client.query(sql, params) // 쿼리 실행
        return result.rows
    } finally {
        if (client) {
            client.release() // 클라이언트 해제
        }
    }
}

module.exports = queryModule