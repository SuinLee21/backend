const express = require("express");

const app = express();
const port = 8000;

app.use(express.json());

app.get("/mainpage", (req, res) => {
    res.sendFile(`${__dirname}/main.html`)
});

function checkValidity(req, res, next) {
    var regexId = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,12}$/; //영어+숫자, 각 최소 1개 이상 8~12
    var regexPw = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,16}$/; //영어+숫자, 각 최소 1개 이상 8~16
    var regexName = /^[가-힣]{2,10}$/ //한글만 2~10;
    var regexPhoneNum = /^010-\d{4}-\d{4}$/;

    if (req.body.id) {
        if (!regexId.test(req.body.id)) {
            alert('아이디를 다시 입력해주세요.');
            res.send("실패");
        }
    }
    if (req.body.pw) {
        if (!regexPw.test(req.body.pw)) {
            alert('비밀번호를 다시 입력해주세요.');
            res.send("실패");
        }
    }
    if (req.body.name) {
        if (!regexName.test(req.body.name)) {
            alert('이름을 다시 입력해주세요.');
            res.send("실패");
        }
    }
    if (req.body.phoneNum) {
        if (!regexPhoneNum.test(req.body.phoneNum)) {
            alert('전화번호를 다시 입력해주세요.');
            res.send("실패");
        }
    }
    next();
}

//로그인
app.post("/login", (req, res) => {
    const { id, pw } = req.body;
    const result = {
        "success": false
    };



    if (id === "suin" && pw === "suin") {
        result.success = true;
    }

    res.send(result);
});

//회원가입
app.post("/signUp", (req, res) => {
    const { id, pw, name, phoneNum } = req.body;
    const result = {
        "success": false
    }

    //정규식
    //db에 입력

    res.send(result);
});

//로그아웃
app.get("/logout", (req, res) => {
    //세션 삭제
    res.sendFile(`${__dirname}/main.html`)
});

//회원탈퇴 //DELETE users는?
app.delete("/users/:idx", (req, res) => {
    const idx = req.params.idx;
    //db에서 데이터 삭제
    res.sendFile(`${__dirname}/main.html`);
});

//아이디 찾기
app.get("/users-id", (req, res) => {
    const { name, phoneNum } = req.body;
    const result = {};

    if (name === "이수인" && phoneNum === "01012345678") {
        result.id = "suin"
    }

    res.send(result);
});

//비밀번호 찾기 //
app.post("/users-password", (req, res) => {
    const { id, name, phoneNum } = req.body;
    const result = {};

    if (id === "suin" && name === "이수인" && phoneNum === "01012345678") {
        result.pw = "suin"
    }

    res.send(result);
});

//내 정보 보기
app.get("/users/:idx", (req, res) => {
    const idx = req.params.idx;
    const result = {};
    //db에서 정보 부르기

    result.id = "suin";
    result.pw = "suin";
    result.name = "이수인";
    result.phoneNum = "01012345678";

    res.send(result);
});

//내 정보 수정
app.put("/users/:idx", (req, res) => {
    const idx = req.params.idx;
    const { id, pw, name, phoneNum } = req.body;
    const result = {};

    result.id = "suin";
    result.pw = "suin";
    result.name = "이수인";
    result.phoneNum = "01012345678";

    res.send(result);
})

//게시글 읽기
app.get("/post/:idx", (req, res) => {
    const idx = req.params.idx;
    const result = {};

    //db에서 가지고 온 내용들 result에 push

    res.send(result);
})

//게시글 작성
app.post("/post", (req, res) => {
    const { title, contents } = req.body;
    //예외처리
    //db에 추가

    res.sendFile(`${__dirname}/main.html`);
})

//게시글 수정
app.put("/post/:idx", (req, res) => {
    const idx = req.params.idx;
    const { title, contents } = req.body;

    //예외처리
    //db에 추가

    res.sendFile(`${__dirname}/main.html`);
})

//게시글 삭제
app.delete("/post/:idx", (req, res) => {
    const idx = req.params.idx;

    //삭제
    res.sendFile(`${__dirname}/main.html`);
})

//댓글 작성
app.post("/comment", (req, res) => {
    const { contents } = req.body;
    //예외처리
    //db에 추가

    res.sendFile(`${__dirname}/main.html`);
})

//댓글 수정
app.put("/comment/:idx", (req, res) => {
    const idx = req.params.idx;
    const { contents } = req.body;

    //예외처리
    //db에 추가
    res.sendFile(`${__dirname}/main.html`);
})

//댓글 삭제
app.delete("/comment/:idx", (req, res) => {
    const idx = req.params.idx;
    //삭제
    res.sendFile(`${__dirname}/main.html`);
})

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