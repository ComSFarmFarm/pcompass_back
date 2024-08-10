import express from "express";
import OpenAI from "openai";

import logger from '../logger.js';
import promises from '../voteInfo/promise.js';

const promiseRouter = express.Router();
// const openai = new OpenAI({apiKey: process.env.OPENAI_API_KEY});

const summary = async (req, res) => {
    logger.info({ip: req.clientIp, type: "promise/summary"});
    const reqJson = req.body;
    const party = reqJson?.party;
    
    const detail = promises[party];
    const result = [
        "민생 챙기기: 전 국민 주거 보장, 교통비 절감, 근로소득자 세부담 완화, 비정규직 차별 해소, 청년 일자리 지원, 양육비 문제 해결 등을 통해 민생 전반을 지원.",
        "저출산 해결: 결혼·출산·양육 지원을 위한 주거 및 금융 지원, 아이돌봄 서비스 강화, 여성 경력단절 방지와 남성 육아휴직 강화로 저출산 문제 해결.",
        "기후위기 대처: 재생에너지 전환, 탄소중립 산업 전환, 탈플라스틱 추진, 농촌을 재생에너지 거점으로 육성하여 기후위기에 대처.",
        "혁신성장과 균형발전: R&D 투자 확대, 첨단산업 육성, AI·미래 모빌리티 강화, 지역균형발전과 자치분권 달성, 서울대 10개 만들기 추진으로 지역 발전 도모.",
        "국민 건강과 행복: 간병비 지원 확대, 공공·필수·지역 의료 강화, 전국민 고용보험과 산재보험 확대, 국민의 문화예술 및 스포츠 접근성 향상.",
        "청년·여성 지원: 청년의 취업 지원 강화, 채용 과정의 성차별 근절, 여성의 경력 단절 방지, 청년 내일채움공제 재도입 등을 통해 청년과 여성의 사회적 지위 향상.",
        "주거 안정: 기본주택 100만 호 조성, 전세사기 피해자 지원, 맞춤형 주거정책 시행으로 주거 안정을 도모.",
        "일자리 창출: 비정규직 차별 해소, 동일가치노동 동일임금 추진, 청년의 양질의 일자리 지원, 주 4일제 도입으로 일자리 질 개선.",
        "재생에너지 확대: RE100 활성화, 탄소중립산업법 제정, 농촌의 재생에너지 산업 거점화로 재생에너지 중심의 에너지 전환 실현.",
        "문화와 관광 지원: 국민휴가지원, 문화예술 창작권 보장, 생활체육시설 확충, 동물 복지 강화로 국민의 문화·관광 생활 질을 높임.",
    ];

    // for (let i = 0; i < detail.length; i++) {
    //     const promise = detail[i];
    //     try {
    //         const response = await openai.chat.completions.create({
    //             model: "gpt-4o-mini",
    //             message: [
    //                 {
    //                     role: "system",
    //                     content: "You are a helpful assistant that summarizes text.",
    //                 },
    //                 {
    //                     role: "user",
    //                     content: `Summarize the following text: ${promise["content"]}`,
    //                 },
    //             ],
    //         });
    //         const summary = response.choices[0];
    //         console.log(summary);
    //         result.push({"title": promise["title"], "content": summary});
    //     } catch (except) {
    //         console.log(except);
    //         return res.status(500).json({
    //             message: except.message,
    //         })
    //     } 
    // }


    return res.status(200).json({
        "party": party,
        "summary": result,
    });
}

const detail = async (req, res) => {
    logger.info({ip: req.clientIp, type: "promise/detail"});
    const reqJson = req.body;
    const party = reqJson?.party;
    const detail = promises[party];

    return res.status(200).json({
        "party": party,
        "detail": detail,
    });
};

// const getCandidateInfo = async (req, res) => {
//     logger.info({ip: req.clientIp, type: "promise/candidateInfo"});
//     const reqJson = req.body;
//     const candidate = reqJson.candidate;

//     const candidateList = await getCandidateList();

//     candidateList.forEach((element) => {
//         if (element.name._text == candidate) {
//             return res.status(200).json({
//                 party: element.jdName._text,
//                 name: element.name._text,
//                 gender: element.gender._text,
//                 birthday: element.birthday._text,
//                 age: element.age._text,
//                 edu: element.edu._text,
//                 career1: element.career1._text,
//                 career2: element.career2._text,
//             })
//         }
//     })
// }

// const getCandidateList = async () => {
//     const url = 'http://apis.data.go.kr/9760000/PofelcddInfoInqireService/getPofelcddRegistSttusInfoInqire';
//     const params = {
//         serviceKey: 'XCYJ5T8hB2m5sXpuMhYIXN3W1urc53SxTGp0306b/qVuUqOVVl9i2mcgmG++Kx17dtLU240ZGa52CgDmdN+m0Q==',
//         pageNo: 1,
//         numOfRows: 100,
//         resultType: 'xml',
//         sgId: '20220309',
//         sgTypecode: '1',
//     };

//     const queryString = qs.stringify(params, {encode: true});

//     try {
//         const response = await axios.get(`${url}?${queryString}`);
//         const data = JSON.parse(convert.xml2json(response.data, {compact: true, spaces: 4}));
//         console.log(data.response.body.items.item);
//         return data.response.body.items.item;
//     } catch (except) {
//         return res.status(500).json({
//             message: except.message,
//         });
//     }
// }

// const getPromise = async (party) => {
//     const url = 'http://apis.data.go.kr/9760000/ElecPrmsInfoInqireService/getCnddtElecPrmsInfoInqire';
//     const params = {
//         serviceKey: 'XCYJ5T8hB2m5sXpuMhYIXN3W1urc53SxTGp0306b/qVuUqOVVl9i2mcgmG++Kx17dtLU240ZGa52CgDmdN+m0Q==',
//         pageNo: 1,
//         numOfRows: 10,
//         resultType: 'xml',
//         sgId: '20220309',
//         sgTypecode: '1',
//         // cnddtId: '100138362',
//         cnddtId: '100138379',
//     };

//     const queryString = qs.stringify(params, {encode: true});

//     try {
//         const response = await axios.get(`${url}?${queryString}`);
//         const data = JSON.parse(convert.xml2json(response.data, {compact: true, spaces: 4}));
//         console.log(data.response);
//         return data.response.body.items;
//     } catch (except) {
//         return res.status(500).json({
//             message: except.message,
//         });
//     }
// }

// promiseRouter.post('/candidateInfo', getCandidateInfo);


promiseRouter.post('/summary', summary);
promiseRouter.post('/detail', detail);

export default promiseRouter;