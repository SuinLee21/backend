const express = require("express");
const bodyParser = require("body-parser");
const session = require('express-session');

const usersApi = require("./src/routes/users");
const postsApi = require("./src/routes/posts");
const commentsApi = require("./src/routes/comments");

const app = express();
const port = 8000;

app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({
    secret: 'SECRET_CODE',
    resave: false,
    saveUninitialized: false
    //time 걸기.
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

    if (userId) {
        if (!regexId.test(userId)) {
            res.send("<script>alert('아이디를 다시 입력해주세요.');location.href='/login';</script>");
        }
    }
    if (userPw) {
        if (!regexPw.test(userPw)) {
            res.send("<script>alert('비밀번호를 다시 입력해주세요.');location.href='/login';</script>");
        }
    }
    if (userName) {
        if (!regexName.test(userName)) {
            res.send("<script>alert('이름을 다시 입력해주세요.');location.href='/login';</script>");
        }
    }
    if (userPhoneNum) {
        if (!regexPhoneNum.test(userPhoneNum)) {
            res.send("<script>alert('전화번호를 다시 입력해주세요.');location.href='/login';</script>");
        }
    }
    next();
}

//로그인
app.post("/login", checkValidity, (req, res) => {
    const { userId, userPw } = req.body;

    if (userId === "qwerqwer1" && userPw === "qwerqwer1!") {
        req.session.idx = idx; //db에서 찾은 idx
        res.redirect('/mainpage');
    } else {
        res.redirect('/login');
    }
});

//회원가입
app.post("/signup", checkValidity, (req, res) => {
    const { userId, userPw } = req.body;
    //db 에 저장
    res.redirect('/mainpage');
});

//로그아웃
app.get("/logout", (req, res) => {
    if (req.session.idx) {
        req.session.destroy();
        res.redirect('/mainpage');
    } else {
        res.redirect('/test1');
    }
});

//아이디 찾기 // 수정
router.get("/users-id", checkValidity, (req, res) => {
    const { userName, userPhoneNum } = req.body;
    const result = {};

    if (userName === "이수인" && userPhoneNum === "01012345678") {
        result.userId = "suin"
    }

    res.send(result);
});

// //아이디 찾기 결과
// router.get("/users-id/:idx", (req, res) => {
//     const idx = req.params.idx;

//     res.send(true);
// });

//비밀번호 찾기 //
router.post("/users-password", (req, res) => {
    const { userId, userName, userPhoneNum } = req.body;
    const result = {};

    if (userId === "suin" && userName === "이수인" && userPhoneNum === "01012345678") {
        result.userPw = "suin"
    }

    res.send(result);
});

// //비밀번호 찾기 결과
// router.post("/users-password/:idx", (req, res) => {
//     const idx = req.params.idx;

//     res.send(true);
// })

app.listen(port, () => {
    console.log(`${port}번에서 HTTP Web Server 실행`);
});