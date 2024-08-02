import pkg from 'pg';  // default import
const { Pool } = pkg;  // 객체 추출


// 기본적인 DB 세팅
const pool = new Pool({
	user: 'DB 사용자 명',
    host: '127.0.0.1', //localhost
    database: 'DB 명',
    password: 'DB 사용자 패스워드',
    port: '5432' //DB 포트번호
});


// 위 세팅해준 DB 세팅정보를 통해 DB에 연결한다
pool.connect();


// 아래와 같이 .query 로 쿼리를 날릴 수 있다
pool.query('SELECT NOW()', (err, res) => {
	console.log(err, res);
    pool.end();
});
