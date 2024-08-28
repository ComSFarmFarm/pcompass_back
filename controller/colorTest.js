import db from "../postgresql.js";
import express from 'express';

const colorRouter = express.Router();

const resultSave = async (req, res) => {
    const colorResult = req.params.result;
    let client;
    
    try {
        client = await db.connect();  // 데이터베이스 연결
        const queryText = "UPDATE users SET color_result = $1 WHERE username = '김예똥';";
        await client.query(queryText, [colorResult]);

        const ageResult = `
        WITH user_age AS (
            SELECT FLOOR((2024 - EXTRACT(YEAR FROM birth_date)) / 10) AS age FROM users WHERE username = '김예똥')
        SELECT color_result FROM users
            WHERE (FLOOR((2024 - EXTRACT(YEAR FROM birth_date)) / 10)) = (SELECT age FROM user_age);`;


        const result = await client.query(ageResult);
        console.log('Query result:', result);

        const colorResults = result.rows.map(row => row.color_result);
        const sum = colorResults.reduce((acc, value) => acc + value, 0); // 값의 총합 계산
        const average = sum / colorResults.length; // 평균 계산
        
        // 클라이언트에 응답 반환
        res.json({ average });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    } finally {
        if (client) {
            client.release();  // 연결 종료
        }
    }
}

colorRouter.get('/colorResult/:result', resultSave);

export default colorRouter;
