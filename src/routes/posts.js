const router = require("express").Router();

//게시글 전체 불러오기

//게시글 읽기
router.get("/posts/:idx", (req, res) => {
    const idx = req.params.idx;
    const result = {};

    //db에서 가지고 온 내용들 result에 push

    res.send(result);
})

//게시글 작성
router.post("/posts", (req, res) => {
    if (req.session.idx) {
        const { title, contents } = req.body;

        //db에 추가

        res.redirect('/mainpage');
    } else {
        res.redirect('/test1');
    }
})

//게시글 수정
router.put("/posts/:idx", (req, res) => {
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
router.delete("/posts/:idx", (req, res) => {
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