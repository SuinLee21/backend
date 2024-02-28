const router = require("express").Router();

//댓글 부르기

//댓글 작성
router.post("/comments", (req, res) => {
    if (req.session.idx) {
        const { contents } = req.body;
        //db에 추가

        res.redirect('/mainpage');
    } else {
        res.redirect('/test1');
    }
})

//댓글 수정
router.put("/comments/:idx", (req, res) => {
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
router.delete("/comments/:idx", (req, res) => {
    const idx = req.params.idx;
    //db에서 값 부르기
    if (req.session.idx === idx) {
        //삭제
        res.redirect('/mainpage');
    } else {
        res.redirect('/test1');
    }
})

module.exports = router;