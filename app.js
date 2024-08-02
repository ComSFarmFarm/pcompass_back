import express from "express";
import authRouter from "./controller/auth.js";
<<<<<<< Updated upstream
=======
import articleRouter from "./controller/news_scraping.js";
import db from "./postgresql.js";

>>>>>>> Stashed changes

const app  = express();

const HOST = "0.0.0.0";
const PORT = 8080;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/auth", authRouter);
app.use("/news", articleRouter);

app.listen(PORT, HOST, () => {
    console.log(`[LOG] Server is running on ${PORT}`);
});

