import express from "express";
import cors from 'cors';
import authRouter from "./controller/auth.js";
import db from "./postgresql.js";


const app  = express();

const HOST = "0.0.0.0";
const PORT = 8080;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use("/auth", authRouter);

db.connect(err => {
    if (err) {
        console.log('connection error', err.stack);
    } else {
        console.log('database connection success!');
    }
});

app.listen(PORT, HOST, () => {
    console.log(`[LOG] Server is running on ${PORT}`);
});