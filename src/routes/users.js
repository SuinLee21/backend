const router = require("express").Router();
const mariadb = require("../../database/connect/mariadb");

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

//회원탈퇴
router.delete("/:idx", (req, res) => {
    const idx = req.params.idx;

    if (req.session.idx === idx) {
        //db에서 데이터 삭제
        res.redirect('/login');
    } else {
        res.redirect('/test1');
    }
});

//내 정보 보기
router.get("/:idx", (req, res) => {
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
router.put("/:idx", checkValidity, (req, res) => {
    const idx = req.params.idx;

    if (req.session.idx === idx) {
        const { userId, userPw, userName, userPhoneNum } = req.body;
        //db에 넣기
        res.redirect('/mainpage');
    } else {
        res.redirect('/test1');
    }
})

module.exports = router;