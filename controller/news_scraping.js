import express from "express";
import axios from 'axios';
import cheerio from 'cheerio';

const articleRouter = express.Router();

let articles = [];

async function fetchArticles() {
  try {
    const url = 'https://news.naver.com/section/100'; // 스크래핑하려는 웹 페이지 URL
    const { data } = await axios.get(url);
    const $ = cheerio.load(data);
    const newArticles = [];

    $('li.sa_item._SECTION_HEADLINE').each((index, element) => {
      const titleElement = $(element).find('div.sa_text a.sa_text_title');
      const title = titleElement.find('strong.sa_text_strong').text().trim();
      const articleUrl = titleElement.attr('href');
      const pressElement = $(element).find('div.sa_text div.sa_text_info');
      const press = pressElement.find('div.sa_text_press').text().trim();
      const sentence = $(element).find('div.sa_text_lede').text().trim();

      // 이미지 URL 추출
      const imageElement = $(element).find('div.sa_thumb_inner img');
      const imageUrl = imageElement.attr('data-src');

      if (title && articleUrl && press && sentence && imageUrl) {
        newArticles.push({
          title,
          url: articleUrl,
          press,
          sentence,
          imageUrl: imageUrl
        });
      }
    });
    articles = newArticles;
    console.log('Articles updated:', articles);
  } catch (error) {
    console.error('Error fetching articles:', error);
  }
}

// 핸들러 함수 정의
const getArticles = async (req, res) => {
  try {
    // 기사 데이터가 없으면, fetchArticles 호출하여 데이터를 업데이트
    if (articles.length === 0) {
      await fetchArticles();
    }
    res.status(200).json(articles); // 200 OK 상태 코드와 함께 응답
  } catch (error) {
    console.error('Error in getArticles handler:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

// 최초 호출로 기사 데이터를 업데이트 (서버 시작 시)
fetchArticles();

const updateInterval = 30 * 60 * 1000; // 30 minutes마다 업데이트
setInterval(fetchArticles, updateInterval);

articleRouter.get('/title', getArticles);

export default articleRouter;