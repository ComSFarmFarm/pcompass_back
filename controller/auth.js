import express from "express";
import jwt from "jsonwebtoken";
import db from "../postgresql.js";

const authRouter = express.Router();

// 회원가입
const signup = async (req, res) => {
    console.log("this is auth/signup.");
    let reqJson = req.body;

    let user_id = reqJson?.user_id; // ?: 데이터가 없으면 undefined! (서버가 죽는 것을 방지함)
    let password = reqJson?.password;
    let username = reqJson?.username;
    let birth_date = reqJson?.birth_date;
    let gender = reqJson?.gender;
    let preferred_party = reqJson?.preferred_party;

    try {
        const signupSql = `INSERT INTO users (user_id, password, username, birth_date, gender, preferred_party) VALUES ($1, encode(digest($2, 'sha256'), 'hex'), $3, $4, $5, $6)`;
        await db.query(signupSql, [user_id, password, username, birth_date, gender, preferred_party]);
        return res.status(200).json({
            message: "회원가입 성공",
        });
    } catch (except) {
        if (except.code === '23505') {
            return res.status(400).json({
                message: "이미 존재하는 아이디입니다.",
            });
        } else if (except.code === '23502') {
            return res.status(400).json({
                message: "필수적인 파라미터가 전달되지 않았습니다.",
            });
        } else {
            return res.status(500).json({
                message: except.message,
            })
        }
    }
}

// 로그인 (with refresh token)
const login = async (req, res) => {
    console.log('this is auth/login.');
    const reqJson = req.body;

    const user_id = reqJson?.user_id;
    const password = reqJson?.password;

    const loginSql = `SELECT user_id, username FROM users WHERE user_id = $1 AND password = encode(digest($2, 'sha256'), 'hex')`;
    const result = await db.query(loginSql, [user_id, password]);

    if (result.rowCount === 1) { // 로그인 성공!
        const user = result.rows[0];
        // refresh token 생성
        const refreshToken = jwt.sign(
            {
                type: "JWT",
                user_id: user.user_id, // 유저 아이디 그대로 저장
                username: user.username,
            },
            process.env.JWT_SECRET_KEY,
            {
                expiresIn: "14d",
                issuer: '경희대서버파괘자',
            },
        );
        // access token 생성
        const accessToken = jwt.sign( // .sing: 토큰 생성 메서드
            {
                type: "JWT",
                user_id: user.user_id,
                username: user.username,
            },
            process.env.JWT_SECRET_KEY,
            {
                expiresIn: "1h", // 15분후 만료
                issuer: "경희대서버파괘자",
            });
        return res.status(200).json({
            message: "로그인 성공",
            accessToken: accessToken,
            refreshToken: refreshToken,
        });
    } else {
        return res.status(400).json({
            message: "로그인 실패",
        });
    }
}

// 아이디 중복 확인
const idExists = async (req, res) => {
    console.log('this is auth/idExists.');
    const reqJson = req.body;
    const user_id = reqJson?.user_id;

    try {
        const query = 'SELECT COUNT(*) FROM users WHERE user_id = $1';
        const result = await db.query(query, [user_id]);

        // 결과 해석
        if (result.rows[0].count > 0) {
            res.status(200).json({
                message: "이미 존재하는 사용자 ID입니다.",
                exists: true
            });
        } else {
            res.status(200).json({
                message: "사용 가능한 사용자 ID입니다.",
                exists: false
            });
        }
    } catch (except) {
        res.status(500).json({
            message: except.message,
        });
    }
};

// username 중복 확인
const usernameExists = async (req, res) => {
    console.log('this is auth/usernameExists.');
    const reqJson = req.body;
    const username = reqJson?.username;

    try {
        const query = 'SELECT COUNT(*) FROM users WHERE username = $1';
        const result = await db.query(query, [username]);

        // 결과 해석
        if (result.rows[0].count > 0) {
            res.status(200).json({
                message: "이미 존재하는 사용자 닉네임입니다.",
                exists: true
            });
        } else {
            res.status(200).json({
                message: "사용 가능한 사용자 닉네임입니다.",
                exists: false
            });
        }
    } catch (except) {
        res.status(500).json({
            message: except.message,
        });
    }
};

// access token 확인 미들웨어
const verifyToken = async (req, res, next) => {
    console.log('this is auth/verifyToken.');
    const accessToken = req.headers.authorization;

    try {
        const result = jwt.verify(accessToken, process.env.JWT_SECRET_KEY); // .verify: 토큰 인증하는 메서드
        req.body.user_id = result.user_id;
        req.body.username = result.username;
        return next();
    } catch (except) {
        if (except.name === "TokenExpiredError") {
            return res.status(400).json({
                message: "토큰이 만료되었습니다.",
            });
        }
        // 토큰의 비밀키가 일치하지 않는 경우
        else if (except.name === "JsonWebTokenError") {
            return res.status(400).json({
                message: "유효하지 않은 토큰입니다.",
            });
        } else {
            return res.status(500).json({
                message: except.message,
            })
        }
    }
}

// 새로운 access token 발급
const refreshToken = async (req, res) => {
    console.log('this is user/refreshToken.');
    const refreshToken = req.body.refreshToken;

    try { // refresh token 기간 만료 여부 확인
        const result = jwt.verify(refreshToken, process.env.JWT_SECRET_KEY);

        // access token 만료 O, refresh token 만료 X => access token만 새로 발급해주면 됨.
        const newAccessToken = jwt.sign(
            {
                type: "JWT",
                user_id: result.user_id,
                user_name: result.user_name,
            },
            process.env.JWT_SECRET_KEY,
            {
            expiresIn: "1m",
            issuer: "경희대서버파괘자",
        });

        return res.status(200).json({
            accessToken: newAccessToken,
        });
    } catch (except) {
        // access token 만료 O, refresh token 만료 O => 둘 다 만료되었으므로, 다시 로그인 권유
        if (except.name === "TokenExpiredError") {
            return res.status(400).json({
                message: "토큰이 만료되었습니다.",
            });
        }
        // 토큰의 비밀키가 일치하지 않는 경우
        else if (except.name === "JsonWebTokenError") {
            return res.status(400).json({
                message: "유효하지 않은 토큰입니다.",
            });
        } else {
            return res.status(500).json({
                message: except.message,
            })
        }
    }
}

// 회원 탈퇴
const delete_user = async (req, res) => {
    console.log('this is user/delete.');
    const reqJson = req.body;
    const user_id = reqJson?.user_id;

    const query = `DELETE FROM users WHERE user_id = $1`;
    const result = await db.query(query, [user_id]);

    if (result.rowCount === 1) { // 탈퇴 성공!
        return res.status(200).json({
            message: "회원 탈퇴 성공",
        });
    } else {
        return res.status(400).json({
            message: "존재하지 않는 아이디입니다.",
        });
    }
}

authRouter.post('/signup', signup);
authRouter.post('/login', login);
authRouter.post('/verifyToken', verifyToken);
authRouter.post('/refreshToken', refreshToken);
authRouter.post('/delete', verifyToken, delete_user);
authRouter.post('/idExists', idExists);
authRouter.post('/usernameExists', usernameExists);


export default authRouter;