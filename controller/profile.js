import express from "express";

import db from "../postgresql.js";
import logger from '../logger.js';

const profileRouter = express.Router();

// 프로필에 구현할 것 : quiz 점수, 테스트 결과, 선호 정당, user_id
const getUserProfile = async(req, res) => {
    logger.info({ip: req.clientIp, type: "profile/set"});
    const { userId } = req.body;
    try {
        // 정보 가져오기
        const infoQuery = `
            SELECT user_id, quiz_score, test_result, preferred_party 
            FROM users
            WHERE user_id = $1
        `;

        const infoResult = await db.query(infoQuery, [userId]);
        
        if (infoResult.rowCount === 1){
            const info = infoQuery.rows[0];
            return res.status(200).json({
                userId: info.user_id,
                quiz_score : info.quiz_score,
                test_result : info.test_result,
                preferred_party : info.preferred_party
            });
        } 
        else {
            return res.status(400).json({
                message: "아이디를 찾을 수 없습니다."
            });
        }
    } catch (error) {
        return res.status(500).json({ 
            message: except.message, 
        });
    }
};

profileRouter.post('/info', getUserProfile);

export default profileRouter;