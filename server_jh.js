const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql');
const cors = require('cors');

// express
const app = express();

// 서버 포트 설정
const PORT = process.env.PORT || 5000;

// 미들웨어 설정
app.use(cors());
app.use(bodyParser.json());

// path 모듈 추가
const path = require('path');
// serve-static 모듈 추가
const static = require('serve-static');
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

// board 조회
app.get('/api/board/:id', (req, res) => {
  const id = req.params.id;

  const sql = `select * from board where id = ?`;

  pool.getConnection((err, con) => {
    if (err) {
      return res.status(500).send(err);
    }

    con.query(sql, id, (err, result) => {
      con.release();
      if (err) {
        return res.status(500).send(err);
      }

      if (result.length > 0) {
        res.json(result);
      } else {
        res.json({ result: 'fail' });
      }
    });
  });
});

// board 작성
app.post('/api/board', (req, res) => {
  const { title, userid, content } = req.body;

  if (!title || !userid || !content) {
    return res.status(400).send('제목, 작성자, 내용을 모두 입력하세요');
  }

  const sql =
    'insert into board(title, userid, content, teamnum) values (?, ?, ?, 0)';

  pool.getConnection((err, con) => {
    if (err) {
      return res.status(500).send(err);
    }

    con.query(sql, [title, userid, content], (err, result) => {
      con.release();
      if (err) {
        return res.status(500).send(err);
      }

      if (result.affectedRows > 0) {
        res.json({ result: 'success' });
      } else {
        res.json({ result: 'fail' });
      }
    });
  });
});

// board 수정
app.put('/api/board/:id', (req, res) => {
  const id = req.params.id;
  const { title, userid, content } = req.body;
  const sql = `update board set title = ?, userid = ?, content = ? where id = ?`;

  pool.getConnection((err, con) => {
    if (err) {
      return res.status(500).send(err);
    }

    con.query(sql, [title, userid, content, id], (err, result) => {
      if (err) {
        return res.status(500).send(err);
      }

      if (result.affectedRows > 0) {
        res.json({ result: 'success' });
      } else {
        res.json({ result: 'fail' });
      }
    });
  });
});

// gitignore
app.listen(PORT, function (req, res) {
  console.log(`========== PIT STOP SERVER is RUNNING : ${PORT} ==========`);
});
