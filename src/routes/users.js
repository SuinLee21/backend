const router = require("express").Router();

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