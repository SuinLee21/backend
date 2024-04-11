const router = require("express").Router();
const jwt = require("jsonwebtoken");

const psql = require("../../database/connect/postgre");
// const mariadb = require("../../database/connect/mariadb");

const checkAuth = require("../middlewares/checkAuth");
const checkValidity = require("../middlewares/checkValidity");
const uploadFile = require("../middlewares/uploadFile");
const checkFile = require("../middlewares/checkFile");

const permission = require("../modules/permission");

//회원탈퇴
router.delete("/", checkAuth(), async (req, res) => {
    let { token } = req.headers;
    const result = {
        "success": false,
        "message": "",
        "data": {
            "token": ""
        }
    };
    req.api = "DELETE/users";

    try {
        await psql.query(`
            DELETE FROM backend.user
            WHERE idx=$1
        `, [req.idx]);

        token = jwt.sign(
            {
                "iss": req.iss,
                "idx": req.idx,
                "name": req.name
            },
            process.env.TOKEN_SECRET_KEY,
            {
                "expiresIn": 1
            }
        )

        result.success = true;
        result.message = "회원탈퇴가 되었습니다.";
        result.data.token = token;
    } catch (err) {
        result.message = err.message;
    } finally {
        res.send(result);
    }
});

//특정 유저 정보 보기
router.get("/", checkAuth(), async (req, res) => {
    const result = {
        "success": false,
        "message": "",
        "data": null
    };
    req.api = "GET/users";

    try {
        const userData = await psql.query(`
            SELECT * FROM backend.user
            WHERE idx=$1
        `, [req.idx]);

        if (userData.rows.length === 0) {
            throw new Error('존재하지 않는 정보입니다.');
        }

        result.success = true;
        result.message = "정상적으로 데이터를 불러왔습니다.";
        result.data = userData.rows;
    } catch (err) {
        result.message = err.message;
    } finally {
        res.send(result);
    }
});

//유저 정보 보기
router.get("/:idx", checkAuth(), async (req, res) => {
    const userIdx = req.params.idx;
    const result = {
        "success": false,
        "message": "",
        "data": null
    };
    req.api = `GET/users/${userIdx}`;

    try {
        const userData = await psql.query(`
            SELECT id, name, phone_num, img_path
            FROM backend.user
            WHERE idx=$1
        `, [userIdx]);

        if (userData.rows.length === 0) {
            throw new Error('존재하지 않는 정보입니다.');
        }

        result.success = true;
        result.message = "정상적으로 데이터를 불러왔습니다.";
        result.data = userData.rows;
    } catch (err) {
        result.message = err.message;
    } finally {
        res.send(result);
    }
});

//특정 유저 정보 수정
router.put("/", checkAuth(), uploadFile, checkFile, checkValidity, async (req, res) => {
    const { userPw, userName, userPhoneNum } = req.body;
    const imgPath = `http://43.203.13.92:8000/${req.imgPath}`;
    let { token } = req.headers;
    const result = {
        "success": false,
        "message": "",
        "data": {
            "token": ""
        }
    };
    req.api = "PUT/users";

    try {
        await psql.query(`
            UPDATE backend.user SET pw=$1, name=$2, phone_num=$3, img_path=$4
            WHERE idx=$4
        `, [userPw, userName, userPhoneNum, req.idx, imgPath]);

        token = jwt.sign(
            {
                "iss": req.iss,
                "idx": req.idx,
                "name": userName,
            },
            process.env.TOKEN_SECRET_KEY,
            {
                "expiresIn": "25m"
            }
        )

        result.success = true;
        result.message = "내 정보가 수정되었습니다.";
        result.data.token = token;
    } catch (err) {
        result.message = err.message;
    } finally {
        res.send(result);
    }
})

module.exports = router;