const router = require("express").Router();

router.get("/:idx", (req, res) => {
    const { idx } = req.params;
    const result = {
        "success": false,
        "message": "",
        "data": null
    }
    //예외처리
    try {
        if (idx === null || idx === undefined || idx === "") {
            throw new Error("idx 값이 존재하지 않습니다.");
        }

        //db 통신
        let info = null;
        if (idx === "10") {
            info = {
                "name": "스테이지어스",
                "birth": "2021",
                "address": "incheon"
            }
        }

        //db 결과 처리
        if (info) {
            result.success = true;
            result.data = info;
        } else {
            result.message = "해당 계정 정보가 존재하지 않습니다.";
        }
    } catch (e) {
        result.message = e;
    } finally {
        res.send(result);
    }
});

//post, put, delete;

//export 작업
module.exports = router;