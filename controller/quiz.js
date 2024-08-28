import express from "express";

import db from "../postgresql.js";
import logger from '../logger.js';

const quizRouter = express.Router();

// 퀴즈 문제와 보기 2개를 유저에게 제공
const quizQuestion = async (req, res) => {
    logger.info({ip: req.clientIp, type: "quiz/question"});
    try {
        // 퀴즈 문제와 보기 2개를 DB에서 가져온다
        const questionQuery = `
            SELECT id, question, option_a, option_b, level 
            FROM quiz_questions 
            ORDER BY RANDOM() 
            LIMIT 1;
        `;

        const questionResult = await db.query(questionQuery);

        if (questionResult.rows.length === 0) {
            return res.status(404).json({ message: "퀴즈를 찾을 수 없습니다." });
        }

        const quiz = questionResult.rows[0];
        return res.status(200).json({
            questionId: quiz.id,
            question: quiz.question,
            options: {
                a: quiz.option_a,
                b: quiz.option_b
            },
            level: quiz.level
        });
    } catch (error) {
        return res.status(500).json({ 
            message: except.message, 
        });
    }
};

// 퀴즈 답변을 받아와서 예상된 정답과 같으면 db에 있는 회원의 quiz_score를 받아와서 점수 +5점 해주기
const quizAnswer = async (req, res) => {
    logger.info({ip: req.clientIp, type: "quiz/answer"});
    const reqJson = req.body;

    const questionId = reqJson?.questionId;
    const answer = reqJson?.answer;
    const userId = reqJson?.userId;

    try {
        // 정답을 DB에서 가져오기
        const answerQuery = `
            SELECT correct_answer, level
            FROM quiz_questions 
            WHERE id = $1;
        `;
        const answerResult = await db.query(answerQuery, [questionId]);

        if (answerResult.rows.length === 0) {
            return res.status(404).json({ message: "퀴즈를 찾을 수 없습니다." });
        }

        const correctAnswer = answerResult.rows[0].correct_answer;
        const score = answerResult.rows[0].level;

        // 유저의 답변이 맞는지 확인
        if (answer === correctAnswer) {
            // 유저의 quiz_score 업데이트
            const updateScoreQuery = `
                UPDATE users 
                SET quiz_score = quiz_score + ${score} 
                WHERE user_id = $1 
                RETURNING quiz_score;
            `;
            const scoreResult = await db.query(updateScoreQuery, [userId]);

            return res.status(200).json({
                message: "정답입니다!",
                newScore: scoreResult.rows[0].quiz_score
            });
        } else {
            return res.status(200).json({
                message: "오답입니다!",
                newScore: null
            });
        }
    } catch (except) {
        return res.status(500).json({ 
            message: except.message,
        });
    }
};

const quizScore = async (req, res) => {
    logger.info({ip: req.clientIp, type: "quiz/score"});
    const reqJson = req.body;

    const userId = reqJson?.userId;

    try {
        // 정답을 DB에서 가져오기
        const answerQuery = `
            SELECT quiz_score
            FROM users
            WHERE user_id = $1;
        `;

        const scoreResult = await db.query(answerQuery, [userId]);

        return res.status(200).json({
            score: scoreResult.rows[0].quiz_score,
        });
    } catch (except) {
        return res.status(500).json({ 
            message: except.message,
        });
    }
}

const quizResult = async (req, res) => {
    logger.info({ip: req.clientIp, type: "quiz/result"});
    const username = "김예똥";

    try {
        const totalRankQuery = `
            WITH ranked_users AS (
                SELECT 
                    username,
                    quiz_score,
                    ROW_NUMBER() OVER (ORDER BY quiz_score DESC) AS rank
                FROM users
            )` ;

        const top4RankQuery = totalRankQuery + `
            SELECT 
                rank,
                username,
                quiz_score
            FROM ranked_users
            WHERE rank <= 4
            ORDER BY rank;
        `
        const myRankQuery = totalRankQuery + `
            SELECT 
                rank,
                username,
                quiz_score
            FROM ranked_users
            WHERE username = $1
        `;

        const top4Rank = await db.query(top4RankQuery);
        const myRank = await db.query(myRankQuery, [username]);

        console.log(top4Rank.rows);
        console.log(myRank.rows);

        return res.status(200).json({
            "top4": top4Rank.rows,
            "my_rank": myRank.rows
        })
    

    } catch(except) {
        return res.status(500).json({ 
            message: except.message,
        });
    }

}


quizRouter.get('/question', quizQuestion);
quizRouter.post('/answer', quizAnswer);
quizRouter.post('/score', quizScore);
quizRouter.get('/result', quizResult);

export default quizRouter;
