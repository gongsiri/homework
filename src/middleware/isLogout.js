const jwt = require("jsonwebtoken");

const isLogout = (req, res, next) => {
    const token = req.cookies.token;

    try {
        if (!token) {
            // 토큰이 없다면 로그아웃 상태로 간주
            next();
        } else {
            // 토큰이 있다면 이미 로그인된 상태로 간주
            throw new Error("already logged in");
        }
    } catch (error) {
        const result = {
            success: false,
            message: "",
        };

        if (error.message === "already logged in") {
            result.message = "이미 로그인된 상태입니다.";
            res.status(400).json(result);
        } else {
            result.message = "오류 발생";
            res.status(500).json(result);
        }
    }
};

module.exports = isLogout;