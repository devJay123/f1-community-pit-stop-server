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

// login & signup. 로그인, 회원가입
// 로그인
app.post('/api/login', (req, res) => {
  const { userid, passwd } = req.body;

  if (!userid || !passwd) {
    return res.status(400).send('id 와 password 모두 입력하세요');
  }
  const sql = 'select * from where ';
});

// signup
app.post('/api/signup', (req, res) => {
  const { name, nickname, userid, passwd, email } = req.body;

  if (!name || !nickname || !userid || !passwd || !email) {
    return res.status(400).send('입력칸을 모두 입력하세요');
  }

  const sql =
    'insert into MEMBER(name, nickname, userid, passwd, email) values (?, ?, ?, ?, ?)';

  pool.getConnection((err, con) => {
    if (err) {
      return res.status(500).send(err);
    }

    con.query(sql, [name, nickname, userid, passwd, email], (err, result) => {
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

// board 작성
app.post('/api/boards', (req, res) => {
  const { title, userid, content, teamnum } = req.body;

  if (!title || !userid || !content || !teamnum) {
    return res.status(400).send('제목, 작성자, 내용을 모두 입력하세요');
  }

  const sql =
    'insert into board(title, userid, content, teamnum) values (?, ?, ?, ?)';

  pool.getConnection((err, con) => {
    if (err) {
      return res.status(500).send(err);
    }

    con.query(sql, [title, userid, content, teamnum], (err, result) => {
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

// app.put('/api/boards/:id', (req, res) => {
//   const { id } = req.params;
//   const { title, userid, content } = req.body;
//   const sql = `UPDATE boards SET title=?, userid=?, content=? WHERE id=?`;
//   pool.query(sql, [title, userid, content, id], (err, result) => {
//     if (err) {
//       console.error('Query error:', err);
//       return res.status(500).json({ result: 'fail', error: err.message });
//     }
//     res.json({ result: 'success' });
//   });
// });

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

app.get('/api/boards/:teamnum/:id', (req, res) => {
  const { teamnum, id } = req.params;
  const query = `SELECT id, title, userid, content, readnum, date_format(wdate, '%Y-%m-%d')wdate from board WHERE teamnum = ? AND id = ?`;

  pool.query(query, [teamnum, id], (error, results) => {
    if (error) {
      console.error('Error fetching board:', error);
      res.status(500).json({ error: 'Failed to fetch board' });
      return;
    }
    res.json(results[0]);
  });
});

app.delete('/api/boards/:id', (req, res) => {
  const id = req.params.id;
  const sql = `delete from board where id=?`;
  pool.getConnection((err, con) => {
    if (err) return res.status(500).send(err); // db연결 오류
    con.query(sql, [id], (err, result) => {
      if (err) return res.status(500).send('Error'); // db연결 오류
      if (result.affectedRows > 0) {
        res.json({ result: 'success' });
      } else {
        res.json({ result: 'fail' });
      }
    });
  });
});

//글 보기 관련
app.put('/api/boardReadNum/:id', (req, res) => {
  const id = req.params.id;
  // 조회수 증가
  const sql = `UPDATE board SET readnum = readnum+1 where id=?`;
  pool.getConnection((err, con) => {
    if (err) return res.status(500).send(err);
    con.query(sql, [id], (err, result) => {
      con.release();
      if (err) return res.status(500).send(err);
      // console.log(result)
      if (result.affectedRows > 0) {
        res.json({ result: 'success' });
      } else {
        return res.status(404).send('Board not found');
      }
    });
  });
});
// 조회수 증가
// app.put('/api/boardReadNum/:id', (req,res)=>{
//   const id=req.params.id;
//   const sql = `UPDATE board SET readnum=readnum+1 where id=?`
//   pool.run(sql,[id],(err) => {
//       if(err) return res.status(500).send(err)
//       res.json({result:'success'})
//   })
// })

// // 조회수 증가
// app.put('/api/boardReadNum/:teamnum/:id', (req,res)=>{
//   const { teamnum, id } = req.params;
//   const sql = `UPDATE board SET readnum=readnum+1 where teamnum=? and id=?`
//   pool.run(sql,[id, teamnum],(err) => {
//       if(err) return res.status(500).send(err)
//       res.json({result:'success'})
//   })
// })

// 조회수 증가
// app.put('/api/boardReadNum/:teamnum/:id', (req,res)=>{
//   const { teamnum, id } = req.params;
//   const sql = `UPDATE board SET readnum=readnum+1 where teamnum=? and id=?`
//   pool.run(sql,[teamnum, id],(err) => {
//       if(err) return res.status(500).send(err)
//       res.json({result:'success'})
//   })
// })

// app.get('/api/boardReadNum/:teamnum/:id', (req,res) => {
//   const { teamnum, id } = req.params;
//   // 조회수 조회
//   const sql = `SELECT readnum FROM board WHERE teamnum = ? AND id = ?`
//   pool.getConnection((err,con) => {
//       if(err) return res.status(500).send(err)
//       con.query(sql, [teamnum ,id],(err, result) => {
//           con.release()
//           if(err) return res.status(500).send(err)
//           // console.log(result)
//           if(result.affectedRows>0) {
//               res.json({result:'success'})
//           }else{
//               return res.status(404).send('Board not found')
//           }
//   })
//   })
// })

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
app.get('/api/boards/:teamnum/:id/reply', (req, res) => {
  const { id } = req.params;
  const query = 'SELECT * FROM reply WHERE board_id = ?';

  pool.query(query, [id], (error, results) => {
    if (error) {
      console.error('Error fetching replies:', error);
      res.status(500).json({ error: 'Failed to fetch replies' });
      return;
    }
    res.json(results);
  });
});

// app.get(`/api/boards/:id/reply`, (req, res) => {
//   const board_id = req.params.id;
//   const sql = `select * from reply where board_id=?`;
//   pool.getConnection((err, con) => {
//     if (err) return res.status(500).send(err);
//     con.query(sql, [board_id], (err, result) => {
//       con.release();
//       if (err) return res.status(500).send(err);
//       res.json(result);
//     });
//   });
// });

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
