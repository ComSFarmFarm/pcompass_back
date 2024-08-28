import express from "express";
import OpenAI from "openai";

import logger from '../logger.js';


const promiseRouter = express.Router();

const candidates = async (req, res) => {
    logger.info({ip: req.clientIp, type: "promise/candidates"});

    axios.get('http://localhost:5000/promise/candidates')
        .then(response => {
            console.log(response.data);
            return res.status(200).json(
                response.data
            );
        }).catch(except => {
            return res.status(500).json({
                message: except.message,
            });
        })
}


const summary = async (req, res) => {
    logger.info({ip: req.clientIp, type: "promise/summary"});
    const reqJson = req.body;

    // const code = reqJson?.code;
    // const region = reqJson?.region;
    const name = reqJson?.name;

    axios.post('http://localhost:5000/promise/summary', {
        // "code": code,
        // "region": region,
        "name": name,
    }).then(response => {
        console.log(response.data);
        return res.status(200).json({
            "summary": response.data
        });
    }).catch(except => {
        return res.status(500).json({
            message: except.message,
        });
    });
}

const detail = async (req, res) => {
    logger.info({ip: req.clientIp, type: "promise/detail"});
    const reqJson = req.body;

    // const region = reqJson?.region;
    const name = reqJson?.name;

    try {
        // flask 서버로 요청
        const response = await axios({
            url: 'http://localhost:5000/promise/detail',
            method: 'POST',
            responseType: 'arraybuffer', // pdf 파일을 바이너리 형태로 받음.
            data: {
                // "region": region,
                "name": name,
            }
        });

        // 클라이언트에게 PDF 파일 응답
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename=file.pdf');
        res.send(response.data);
    } catch (except) {
        return res.status(500).json({
            message: except.message,
        });
    }

    // axios.post('http://localhost:5000/promise/detail', {
    //     // "code": code,
        // "region": region,
    //     "name": name,
    // }).then(response => {
    //     console.log(response);
    //     // return res.status(200).json({
    //     //     "summary": response.data
    //     // });
    // }).catch(except => {
    //     return res.status(500).json({
    //         message: except.message,
    //     });
    // });

    // return res.status(200).json({
    //     "party": party,
    //     "detail": detail,
    // });
};

const keywords = async (req, res) => {
    logger.info({ip: req.clientIp, type: "promise/keywords"});
    const reqJson = req.body;

    // const code = reqJson?.code;
    // const region = reqJson?.region;
    const name = reqJson?.name;

    axios.post('http://localhost:5000/promise/keywords', {
        // "code": code,
        // "region": region,
        "name": name,
    }).then(response => {
        let jsonMatch = response.data.match(/\[[\s\S]*?\]/);
        let result = jsonMatch[0];

        result.replace(/`/g, '')
            .replace(/(\r\n|\n|\r)/g, '')  
            .trim();

        result = JSON.parse(result);

        return res.status(200).json({
            "words": result
        });
    }).catch(except => {
        return res.status(500).json({
            message: except.message,
        });
    });
}




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


promiseRouter.get('/candidates', candidates);
promiseRouter.post('/summary', summary);
promiseRouter.post('/detail', detail);
promiseRouter.post('/keywords', keywords);

export default promiseRouter;