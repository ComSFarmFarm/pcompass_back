import express from "express";
import cors from 'cors';
import requestIp from 'request-ip';

import db from "./postgresql.js";
import logger from './logger.js';
import authRouter from "./controller/auth.js";
import promiseRouter from "./controller/promise.js";
import articleRouter from "./controller/news_scraping.js";


const app  = express();

const HOST = "0.0.0.0";
const PORT = 8080;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(requestIp.mw());

app.use("/auth", authRouter);

db.connect(err => {
    if (err) {
        console.log('database connection error', err.stack);
    } else {
        console.log('database connection success!');
    }
});

app.get('/', (req, res) => {
    logger.info({ip: req.clientIp, type: "/"});
    return res.send('Hello, World!');
})


app.listen(PORT, HOST, () => {
    console.log(`[LOG] Server is running on ${PORT}`);
});