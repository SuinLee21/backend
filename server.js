const express = require("express");

const app = express();
const port = 8000;

app.use(express.json());

app.get("/mainpage", (req, res) => {
    res.sendFile(`${__dirname}/main.html`)
});

app.post("/login", (req, res) => {
    const { id, pw } = req.body;
    const result = {
        "success": false
    }

    if (id === "suin" && pw === "suin") {
        result.success = true;
    }

    res.send(result);
});

app.post("/signUp", (req, res) => {
    const { id, pw, name, phoneNum } = req.body;
    const result = {
        "success": false
    }

    //정규식
    //db에 입력

    res.send(result);
});

app.get("/logout", (req, res) => {
    //세션 삭제
    res.sendFile(`${__dirname}/main.html`)
});

app.delete("/withdrawal", (req, res) => {
    //db에서 데이터 삭제
    res.sendFile(`${__dirname}/main.html`);
});

app.get("/users/id", (req, res) => {
    const { name, phoneNum } = req.body;
    const result = {};

    if (name === "이수인" && phoneNum === "01012345678") {
        result.id = "suin"
    }

    res.send(result);
});

app.post("/users/password", (req, res) => {
    const { id, name, phoneNum } = req.body;
    const result = {};

    if (id === "suin" && name === "이수인" && phoneNum === "01012345678") {
        result.pw = "suin"
    }

    res.send(result);
});

app.listen(port, () => {
    console.log(`${port}번에서 HTTP Web Server 실행`);
});


//로그인
//회원가입
//로그아웃
//회원탈퇴
//아이디 찾기
//비밀번호 찾기
//내정보 보기
//내정보 수정
//게시글 쓰기
//게시글 읽기
//게시글 수정
//게시글 삭제
//댓글 쓰기
//댓글 수정
//댓글 삭제