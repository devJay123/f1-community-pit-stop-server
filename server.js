const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql');
const cors = require('cors');

// express
const app = express();

// 서버 포트 설정
const PORT = process.env.PORT || 8000;

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

// board 조회
/* app.get('/api/board/:id', (req, res) => {
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
}); */

// board 작성
app.post('/api/boards', (req, res) => {
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
app.put('/api/boards/:id', (req, res) => {
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

//--------------------------게시판 조회-------------------------------
app.get('/api/boards', (req, res) => {
  // offset 피라미터값 받기
  let offset = req.query.offset;
  if (!offset) {
    offset = 0;
  }

  // console.log('get /api/members')
  const sql = `SELECT id, title, userid, content, readnum, date_format(wdate, '%Y-%m-%d') wdate from board `;
  pool.getConnection((err, con) => {
    if (err) return res.status(500).json(err); // db 연결오류
    con.query(sql, (err, result) => {
      con.release();
      if (err) return res.status(500).json(err); // sql문 오류
      res.json(result);
    });
  });
});

// 글 보기
app.get('/api/boards/:id', (req, res) => {
  const id = req.params.id;
  // console.log('id: ',id)

  // console.log('get /api/members')
  const sql =
    "SELECT id, title, userid, content, readnum, date_format(wdate, '%Y-%m-%d')wdate from board where id=?";
  pool.getConnection((err, con) => {
    if (err) return res.status(500).send('Internal Server Error'); // db 연결오류
    con.query(sql, [id], (err, result) => {
      con.release();
      if (err) return res.status(500).json(err); // sql문 오류
      res.json(result);
    });
  });
});

//--------------------------댓글 쓰기-------------------------------

app.post(`/api/boards/:id/reply`, (req, res) => {
  const board_id = req.params.id;
  console.log(board_id);
  const { userid, content } = req.body;
  const sql = `insert into reply(userid, content, board_id) values(?,?,?)`;

  pool.getConnection((err, con) => {
    if (err) return res.status(500).send(err);
    con.query(sql, [userid, content, board_id], (err, result) => {
      con.release();
      if (err) return res.status(500).send(err);
      if (result.affectedRows > 0) {
        res.json({ result: 'success' });
      } else {
        res.json({ result: 'fail' });
      }
    });
  });
});

//--------------------------댓글-------------------------------
app.get(`/api/boards/:id/reply`, (req, res) => {
  const board_id = req.params.id;
  const sql = `select * from reply where board_id=?`;
  pool.getConnection((err, con) => {
    if (err) return res.status(500).send(err);
    con.query(sql, [board_id], (err, result) => {
      con.release();
      if (err) return res.status(500).send(err);
      res.json(result);
    });
  });
});

app.delete(`/api/boards/reply/:rid`, (req, res) => {
  const rid = req.params.rid;
  console.log('rid: ', rid);
  const sql = `delete from reply where id=?`;
  pool.getConnection((err, con) => {
    if (err) return res.status(500).send(err);
    con.query(sql, [rid], (err, result) => {
      con.release();
      if (err) return res.status(500).send(err);
      if (result.affectedRows > 0) {
        res.json({ result: 'success' });
      } else {
        res.json({ result: 'fail' });
      }
    });
  });
});
app.put(`/api/boards/reply/:rid`, (req, res) => {
  const { rid } = req.params;
  const { userid, content } = req.body;
  const sql = `update reply set userid=?, content=?, wdate=now() where id=?`;

  pool.getConnection((err, con) => {
    if (err) return res.status(500).send(err);
    con.query(sql, [userid, content, rid], (err, result) => {
      con.release();
      if (err) return res.status(500).send(err);
      if (result.affactedRows > 0) {
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
