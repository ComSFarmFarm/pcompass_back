import express from "express";
import jwt from "jsonwebtoken";
//import pool from "./postgresql.js";

const authRouter = express.Router();

// 회원가입
const signup = async (req, res) => {
    console.log("this is auth/signup.");
    console.log(req.ip);
    let reqJson = req.body;

    let user_id = reqJson?.user_id; // ?: 데이터가 없으면 undefined! (서버가 죽는 것을 방지함)
    let password = reqJson?.password;
    let username = reqJson?.username;
    let gender = reqJson?.gender;
    let birth_date = reqJson?.birth_date;
    let preferred_party = reqJson?.preferred_party

    console.log(user_id);
    console.log(password);
    console.log(username);
    console.log(gender);
    console.log(birth_date);
    console.log(preferred_party);

    try {
        // 마리아 db
        //const singup_sql = `insert into users (user_id, password, username) values (?,sha2(?,256),?)`;
        //await maria.promise().query(singup_sql, [user_id, password,username]); // 배열 안의 값들이 위의 (?, ?, ?)로 들어감

        // postgresql
        const signup_sql = `INSERT INTO users (user_id, password, username) VALUES ($1, crypt($2, gen_salt('bf')), $3)`;
        await pool.query(signup_sql, [user_id, password, username]);

    } catch (except) {
        //postgresql
        console.error(except);
        if (except.code === '23505') {
            // PostgreSQL의 UNIQUE 제약조건 위반 오류 코드
            return res.status(400).json({
                message: "이미 존재하는 아이디입니다.",
            });
        } else if (except.code === '23502') {
            return res.status(400).json({
                message: "필수적인 파라미터가 전달되지 않았습니다.",
            });
        }
        
        /*if (except.errno === 1048) {
            return res.status(400).json({
                message: "필수적인 파라미터가 전달되지 않았습니다.",
            });
        } else if (except.errno === 1062) {
            return res.status(400).json({
                message: "이미 존재하는 아이디입니다.",
            });
        }*/
        
    }
    return res.status(200).json({
        message: "회원가입 완료",
    });
}

// 로그인 (with refresh token)
const login = async (req, res) => {
    console.log('this is auth/login.');
    const reqJson = req.body;

    const id = reqJson?.id;
    const password = reqJson?.password;

    console.log(id);
    console.log(password);

    //const query = `select user_id, user_name from users where user_id = ? and user_password = sha2(?, 256)`;
    //const [rows, fields] = await maria.promise().query(query, [id, password]);
    const query = `SELECT user_id, username FROM users WHERE user_id = $1 AND password = crypt($2, password)`;
    const result = await pool.query(query, [id, password]);

    if (result.rows.length === 1) { // 로그인 성공!
        const user = result.rows[0];
        // refresh token 생성
        const refreshToken = jwt.sign(
            {
                type: "JWT",
                id: user.id, // 유저 아이디 그대로 저장
                username: user.username,
            },
            process.env.JWT_SECRET_KEY,
            {
                expiresIn: "15m", // 14d
                issuer: '경희대서버파괘자',
            },
        );
        /*
        // db에 refresh token 삽입
        const temp_query = `select user_id from users where user_id = ?`;
        const [temp_rows, temp_fields] = await maria.promise().query(temp_query, [user_id]);
        console.log(temp_rows[0].id);

        const query = `insert into tokens (content, user_id) values (?, ?)`;
        await maria.promise().query(query, [refreshToken, temp_rows[0].id]);
        */
        // access token 생성
        const accessToken = jwt.sign( // .sing: 토큰 생성 메서드
            {
                type: "JWT",
                id: user.id,
                username: user.username,
            },
            process.env.JWT_SECRET_KEY,
            {
                expiresIn: "5m", // 15분후 만료
                issuer: "경희대서버파괘자",
            });
        res.status(200).json({
            message: "로그인 완료",
            accessToken: accessToken,
            refreshToken: refreshToken,
        });
    } else {
        res.status(401).json({
            message: "일치하는 로그인 데이터가 없습니다.",
        });
    }
}

// 한번 따라서 작성해본 prototype
const checkDuplicateId = async (req, res) => {
    const reqJson = req.body;
    const user_id = reqJson?.user_id;

    if (!user_id) {
        return res.status(400).json({
            message: "ID를 입력해주세요.",
        });
    }

    try {
        // PostgreSQL 쿼리 작성
        const query = 'SELECT COUNT(*) FROM users WHERE user_id = $1';
        const result = await pool.query(query, [user_id]);

        // 결과 해석
        const count = parseInt(result.rows[0].count, 10);

        if (count > 0) {
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
    } catch (error) {
        console.error('Database query error:', error);
        res.status(500).json({
            message: "서버 오류가 발생했습니다.",
        });
    }
};

// 토큰 확인 (origin)
const verifyToken = async (req, res) => {
    console.log('this is auth/verifyToken.');

    try {
        const accessToken = req.headers.authorization;
        //const accessToken = req.headers.authorization?.split(' ')[1]; // "Bearer <token>"에서 <token> 부분만 추출
        req.decoded = jwt.verify(accessToken, process.env.JWT_SECRET_KEY); // .verify: 토큰 인증하는 메서드
        res.status(200).json({
            id: req.decoded.id, // accessToken payload에 담았던 값들
            username: req.decoded.username,
        });
    } catch (err) {
        if (err.name === "TokenExpiredError") {
            return res.status(419).json({
                message: "토큰이 만료되었습니다.",
            });
        }
        // 토큰의 비밀키가 일치하지 않는 경우
        else if (err.name === "JsonWebTokenError") {
            return res.status(401).json({
                message: "유효하지 않은 토큰입니다.",
            });
        }
    }
}

// 새로운 access token 발급
const refreshToken = async (req, res) => {
    console.log('this is user/refreshToken.');
    //const accessToken = req.headers.authorization?.split(' ')[1];
    const accessToken = req.headers.authorization;
    const refreshToken = req.body.refreshToken;
    console.log(accessToken);
    console.log(refreshToken);

    // access token 확인
    try {
        req.decoded = jwt.verify(accessToken, process.env.JWT_SECRET_KEY); // .verify: 토큰 인증하는 메서드
    } catch (err) {
        if (err.name === "TokenExpiredError") { // access token 기간이 만료된 경우
            try { // refresh token 기간 만료 여부 확인
                req.decoded = jwt.verify(refreshToken, process.env.JWT_SECRET_KEY);

                // access token 만료 O, refresh token 만료 X => access token만 새로 발급해주면 됨.
                const newAccessToken = jwt.sign(
                    {
                        type: "JWT",
                        id: req.decoded.user_id,
                        user_name: req.decoded.user_name,
                    },
                    process.env.JWT_SECRET_KEY,
                    {
                    expiresIn: "14d",
                    issuer: "경희대서버파괘자",
                });

                res.status(200).json({
                    message: "새로운 access token이 발급되었습니다.",
                    accessToken: newAccessToken,
                    refreshToken: refreshToken,
                });
            } catch (err) { // refresh token 기간이 만료되었을 때
                // access token 만료 O, refresh token 만료 O => 둘 다 만료되었으므로, 다시 로그인 권유
                return res.status(419).json({
                    message: "access token과 refresh token이 모두 만료되었습니다.",
                });
            }
        }
        // 토큰의 비밀키가 일치하지 않는 경우
        else if (err.name === "JsonWebTokenError") {
            return res.status(401).json({
                message: "유효하지 않은 토큰입니다.",
            });
        }
    }
}

// 회원 탈퇴
const delete_user = async (req, res) => {
    console.log('this is user/delete.');
    const reqJson = req.body;
    const user_id = reqJson?.user_id;

    //const query = `delete from users where user_id = ?`;
    //const rows = await maria.promise().query(query, user_id);

    const query = `DELETE FROM users WHERE user_id = $1`;
    const result = await pool.query(query, [user_id]);

    if (result.affectedRows === 1) { // 탈퇴 성공!
        res.status(200).json({
            message: "회원 탈퇴 완료",
        });
    } else {
        res.status(401).json({
            message: "존재하지 않는 아이디입니다.",
        });
    }
}

authRouter.post('/signup', signup);
authRouter.post('/login', login);
authRouter.post('/verifyToken', verifyToken);
authRouter.post('/refreshToken', refreshToken);
authRouter.post('/delete', delete_user);
authRouter.post('/checkDuplicateId', checkDuplicateId);

export default authRouter;