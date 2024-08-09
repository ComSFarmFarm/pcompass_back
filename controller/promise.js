import express from "express";
import axios from 'axios';
import cheerio from 'cheerio';
import qs from 'qs'
import convert from 'xml-js';

import logger from '../logger.js';

const promiseRouter = express.Router();

const summery = async (req, res) => {
    logger.info({ip: req.clientIp, type: "promise/summery"});
    const reqJson = req.body;
    const party = reqJson?.party;



}

const detail = async (req, res) => {
    logger.info({ip: req.clientIp, type: "promise/detail"});
    const reqJson = req.body;
    const party = reqJson?.party;

    const promise = await getPromise(party);
    console.log(promise);

    const candidate = promise.krName._text;
    const promiseCnt = promise.prmsCnt._text;




        
};

const getCandidateInfo = async (req, res) => {
    logger.info({ip: req.clientIp, type: "promise/candidateInfo"});
    const reqJson = req.body;
    const candidate = reqJson.candidate;

    const candidateList = await getCandidateList();

    candidateList.forEach((element) => {
        if (element.name._text == candidate) {
            return res.status(200).json({
                party: element.jdName._text,
                name: element.name._text,
                gender: element.gender._text,
                birthday: element.birthday._text,
                age: element.age._text,
                edu: element.edu._text,
                career1: element.career1._text,
                career2: element.career2._text,
            })
        }
    })
}

const getCandidateList = async () => {
    const url = 'http://apis.data.go.kr/9760000/PofelcddInfoInqireService/getPofelcddRegistSttusInfoInqire';
    const params = {
        serviceKey: 'XCYJ5T8hB2m5sXpuMhYIXN3W1urc53SxTGp0306b/qVuUqOVVl9i2mcgmG++Kx17dtLU240ZGa52CgDmdN+m0Q==',
        pageNo: 1,
        numOfRows: 100,
        resultType: 'xml',
        sgId: '20220309',
        sgTypecode: '1',
    };

    const queryString = qs.stringify(params, {encode: true});

    try {
        const response = await axios.get(`${url}?${queryString}`);
        const data = JSON.parse(convert.xml2json(response.data, {compact: true, spaces: 4}));
        console.log(data.response.body.items.item);
        return data.response.body.items.item;
    } catch (except) {
        return res.status(500).json({
            message: except.message,
        });
    }
}

const getPromise = async (party) => {
    const url = 'http://apis.data.go.kr/9760000/ElecPrmsInfoInqireService/getCnddtElecPrmsInfoInqire';
    const params = {
        serviceKey: 'XCYJ5T8hB2m5sXpuMhYIXN3W1urc53SxTGp0306b/qVuUqOVVl9i2mcgmG++Kx17dtLU240ZGa52CgDmdN+m0Q==',
        pageNo: 1,
        numOfRows: 10,
        resultType: 'xml',
        sgId: '20220309',
        sgTypecode: '1',
        // cnddtId: '100138362',
        cnddtId: '100138379',
    };

    const queryString = qs.stringify(params, {encode: true});

    try {
        const response = await axios.get(`${url}?${queryString}`);
        const data = JSON.parse(convert.xml2json(response.data, {compact: true, spaces: 4}));
        console.log(data.response);
        return data.response.body.items;
    } catch (except) {
        return res.status(500).json({
            message: except.message,
        });
    }
}

promiseRouter.post('/candidateInfo', getCandidateInfo);


promiseRouter.post('/summery', summery);
promiseRouter.post('/detail', detail);

export default promiseRouter;