const express = require("express");
const bodyParser = require("body-parser");
const session = require('express-session');

const usersApi = require("./routes/users");
const postsApi = require("./routes/posts");
const commentsApi = require("./routes/comments");

const mariadb = require("../database/connect/mariadb");
mariadb.connect();

const app = express();
const port = 8000;
const maxAge = 30 * 60 * 1000;

app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({
    secret: 'SECRET_CODE',
    resave: false,
    saveUninitialized: false,
    checkPeriod: maxAge
}));

app.use("/users", usersApi);
app.use("/posts", postsApi);
app.use("/comments", commentsApi);

const checkValidity = (req, res, next) => {
    const regexId = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,12}$/; //영어+숫자, 각 최소 1개 이상 8~12
    const regexPw = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,16}$/; //영어+숫자, 각 최소 1개 이상 8~16
    const regexName = /^[가-힣]{2,10}$/ //한글만 2~10;
    const regexPhoneNum = /^010-\d{4}-\d{4}$/;

    const { userId, userPw, userName, userPhoneNum } = req.body;
    const result = {
        "message": ""
    };

    if (userId) {
        if (!regexId.test(userId)) {
            result.message = "아이디를 다시 입력해주세요";
            res.send(result);
        }
    }
    if (userPw) {
        if (!regexPw.test(userPw)) {
            result.message = "비밀번호를 다시 입력해주세요";
            res.send(result);
        }
    }
    if (userName) {
        if (!regexName.test(userName)) {
            result.message = "이름을 다시 입력해주세요";
            res.send(result);
        }
    }
    if (userPhoneNum) {
        if (!regexPhoneNum.test(userPhoneNum)) {
            result.message = "전화번호를 다시 입력해주세요";
            res.send(result);
        }
    }

    next();
}

//로그인
app.post("/login", checkValidity, (req, res) => {
    const { userId, userPw } = req.body;
    const sql = "SELECT * FROM user WHERE id=? AND pw=?";
    const params = [userId, userPw];
    const result = {
        "success": false,
        "message": "",
        "data": null
    };

    try {
        mariadb.query(sql, params, (err, rows) => {
            if (err) {
                throw new Error(err);
            } else {
                // 일치 여부 확인
                if (rows[0].id !== userId || rows[0].pw !== userPw) {
                    throw new Error("회원 정보가 일치하지 않습니다.");
                } else {
                    result.success = true;
                    result.message = "로그인 성공.";
                    result.data = rows;
                }
            }
        })
    } catch (e) {
        result.message = e;
    } finally {
        res.send(result);
    }
});

//회원가입
app.post("/signup", checkValidity, (req, res) => {
    const { userId, userPw, userName, userPhoneNum } = req.body;
    const sql = "INSERT INTO user(id, pw, name, phoneNum) VALUES(?, ?, ?, ?)";
    const params = [userId, userPw, userName, userPhoneNum];
    const result = {
        "success": false,
        "message": ""
    };

    try {
        mariadb.query(sql, params, (err, rows) => {
            if (err) {
                throw new Error(err);
            } else {
                result.success = true;
                result.message = "정상적으로 가입되었습니다.";
            }
        })
    } catch (e) {
        result.message = e;
    } finally {
        res.send(result);
    }
});

//로그아웃
app.get("/logout", (req, res) => {
    const result = {
        "success": false,
        "message": ""
    };

    try {
        if (!req.session.idx) {
            throw new Error("접근 권한이 없습니다.");
        } else {
            req.session.destroy();
            result.success = true;
            result.message = "로그아웃 되었습니다.";
        }
    } catch (e) {
        result.message = e;
    } finally {
        res.send(result);
    }
});

//아이디 찾기 // 수정
app.get("/users-id", checkValidity, (req, res) => {
    const { userName, userPhoneNum } = req.body;
    const sql = "SELECT * FROM user WHERE name=? AND phoneNum=?";
    const params = [userId, userPw];
    const result = {
        "success": false,
        "message": "",
        "data": null
    };

    try {
        mariadb.query(sql, params, (err, rows) => {
            if (err) {
                throw new Error(err);
            } else {
                // 일치 여부 확인
                if (rows[0].name !== userName || rows[0].phoneNum !== userPhoneNum) {
                    throw new Error("회원 정보가 일치하지 않습니다.");
                } else {
                    result.success = true;
                    result.message = "아이디 찾기 성공.";
                    result.data = rows[0].id;
                }
            }
        })
    } catch (e) {
        result.message = e;
    } finally {
        res.send(result);
    }
});

//비밀번호 찾기 //
app.post("/users-password", checkValidity, (req, res) => {
    const { userId, userName, userPhoneNum } = req.body;
    const sql = "SELECT * FROM user WHERE id=? AND name=? AND phoneNum=?";
    const params = [userId, userName, userPhoneNum];
    const result = {
        "success": false,
        "message": "",
        "data": null
    };

    try {
        mariadb.query(sql, params, (err, rows) => {
            if (err) {
                throw new Error(err);
            } else {
                // 일치 여부 확인
                if (rows[0].id !== userId || rows[0].name !== userName || rows[0].phoneNum !== userPhoneNum) {
                    throw new Error("회원 정보가 일치하지 않습니다.");
                } else {
                    result.success = true;
                    result.message = "아이디 찾기 성공.";
                    result.data = rows[0].pw;
                }
            }
        })
    } catch (e) {
        result.message = e;
    } finally {
        res.send(result);
    }
});

app.listen(port, () => {
    console.log(`${port}번에서 HTTP Web Server 실행`);
});