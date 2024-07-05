const express = require("express");
const mysql = require("mysql");
const cors = require("cors");
const path = require("path");
const { log } = require("console");

// express
const app = express();

// 서버 포트 설정
const PORT = process.env.PORT || 5000;

// 미들웨어 설정
app.use(cors());

// http://localhost:5000/ 요청이 오면 was 서버의
// public 폴더를 찾아서 그 안에 있는 index.html을 서비스하도록 설정
app.use("/", express.static(path.join(__dirname, "public")));

// db 접속
const pool = mysql.createPool({
  connectionLimit: 10,
  host: "svc.sel5.cloudtype.app",
  user: "root",
  password: "1234",
  port: "31635",
  database: "pitstop",
});

// 게시판 DB 가져오기
app.get(`/api/boardlist/:teamnum`, function (req, res) {
  let temanum = req.params.teamnum;

  // marraDB 불러오기
  const sql = `select id, title, userid, readnum, date_format(wdate, '%Y.%m.%d %H:%i') wdate From board where teamnum=? order by id desc`;

  pool.getConnection(function (err, con) {
    if (err) return res.status(500).send(err);
    con.query(sql, temanum, function (err, result) {
      con.release();
      if (err) return res.status(500).send(err);
      if (result) {
        res.json(result);
      } else {
        res.json(`${temanum} SEND FAIL`);
      }
    });
  });
});

// gitignore
app.listen(PORT, function (req, res) {
  console.log(`========== PIT STOP SERVER is RUNNING : ${PORT} ==========`);
});
