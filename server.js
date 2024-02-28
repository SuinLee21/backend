const express = require("express");
const bodyParser = require("body-parser");
const session = require('express-session');

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

app.get("/mainpage", (req, res) => {
    res.sendFile(`${__dirname}/main.html`)
});
app.get("/login", (req, res) => {
    res.sendFile(`${__dirname}/login.html`)
});
app.get("/test", (req, res) => {
    if (req.session.idx) {
        res.sendFile(`${__dirname}/test.html`);
    } else {
        res.sendFile(`${__dirname}/test1.html`);
    }
});
app.get("/test1", (req, res) => {
    res.sendFile(`${__dirname}/test1.html`)
});

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

//회원탈퇴
app.delete("/users/:idx", (req, res) => {
    const idx = req.params.idx;
    //get 이랑 delete는 req로 받을 수 없음.
    if (req.session.idx === idx) {
        //db에서 데이터 삭제
        res.redirect('/login');
    } else {
        res.redirect('/test1');
    }
});

//아이디 찾기 // 수정
app.get("/users-id", checkValidity, (req, res) => {
    const { userName, userPhoneNum } = req.body;
    const result = {};

    if (userName === "이수인" && userPhoneNum === "01012345678") {
        result.userId = "suin"
    }

    res.send(result);
});

// //아이디 찾기 결과
// app.get("/users-id/:idx", (req, res) => {
//     const idx = req.params.idx;

//     res.send(true);
// });

//비밀번호 찾기 //
app.post("/users-password", (req, res) => {
    const { userId, userName, userPhoneNum } = req.body;
    const result = {};

    if (userId === "suin" && userName === "이수인" && userPhoneNum === "01012345678") {
        result.userPw = "suin"
    }

    res.send(result);
});

// //비밀번호 찾기 결과
// app.post("/users-password/:idx", (req, res) => {
//     const idx = req.params.idx;

//     res.send(true);
// })

//내 정보 보기
app.get("/users/:idx", (req, res) => {
    const idx = req.params.idx;
    const result = {};

    if (req.session.id === idx) {
        //db에서 정보 부르기
        result.userId = "suin";
        result.userPw = "suin";
        result.userName = "이수인";
        result.userPhoneNum = "01012345678";

        res.send(result);
    } else {
        res.redirect('/test1');
    }
});

//내 정보 수정
app.put("/users/:idx", checkValidity, (req, res) => {
    const idx = req.params.idx;

    if (req.session.idx === idx) {
        const { userId, userPw, userName, userPhoneNum } = req.body;
        //db에 넣기
        res.redirect('/mainpage');
    } else {
        res.redirect('/test1');
    }
})

//게시글 전체 불러오기

//게시글 읽기
app.get("/posts/:idx", (req, res) => {
    const idx = req.params.idx;
    const result = {};

    //db에서 가지고 온 내용들 result에 push

    res.send(result);
})

//게시글 작성
app.post("/posts", (req, res) => {
    if (req.session.idx) {
        const { title, contents } = req.body;

        //db에 추가

        res.redirect('/mainpage');
    } else {
        res.redirect('/test1');
    }
})

//게시글 수정
app.put("/posts/:idx", (req, res) => {
    const idx = req.params.idx;
    //db에서 값 부르기
    if (req.session.idx === idx) {
        const { title, contents } = req.body;

        //db에 추가

        res.redirect('/mainpage');
    } else {
        res.redirect('/test1');
    }
})

//게시글 삭제
app.delete("/posts/:idx", (req, res) => {
    const idx = req.params.idx;
    //db에서 값 부르기
    if (req.session.idx === idx) {
        //삭제
        res.redirect('/mainpage');
    } else {
        res.redirect('/test1');
    }
})

//댓글 부르기

//댓글 작성
app.post("/comments", (req, res) => {
    if (req.session.idx) {
        const { contents } = req.body;
        //db에 추가

        res.redirect('/mainpage');
    } else {
        res.redirect('/test1');
    }
})

//댓글 수정
app.put("/comments/:idx", (req, res) => {
    const idx = req.params.idx;
    //db에서 값 부르기
    if (req.session.idx === idx) {
        const { contents } = req.body;

        //db에 추가
        res.redirect('/mainpage');
    } else {
        res.redirect('/test1');
    }
})

//댓글 삭제
app.delete("/comments/:idx", (req, res) => {
    const idx = req.params.idx;
    //db에서 값 부르기
    if (req.session.idx === idx) {
        //삭제
        res.redirect('/mainpage');
    } else {
        res.redirect('/test1');
    }
})

app.listen(port, () => {
    console.log(`${port}번에서 HTTP Web Server 실행`);
});