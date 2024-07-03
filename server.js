const express = require('express');
const mysql = require('mysql');
const cors = require('cors');

// express
const app = express();

// 서버 포트 설정
const PORT = process.env.PORT || 5000;

// 미들웨어 설정
app.use(cors());

// http://localhost:5000/ 요청이 오면 was 서버의
// public 폴더를 찾아서 그 안에 있는 index.html을 서비스하도록 설정
app.use('/', static(path.join(__dirname, 'public')));

// db 접속
const pool = mysql.createPool({
  connectionLimit: 10,
  host: 'svc.sel5.cloudtype.app',
  user: 'root',
  password: '1234',
  port: '31635',
  database: 'pitstop',
});
