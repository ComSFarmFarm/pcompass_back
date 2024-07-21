import express from "express";
import authRouter from "./controller/auth.js";

const app  = express();

const HOST = "0.0.0.0";
const PORT = 8080;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/auth", authRouter);

app.listen(PORT, HOST, () => {
    console.log(`[LOG] Server is running on ${PORT}`);
});

