const fs = require("fs");
const psql = require("../../database/connect/postgre");

const idDuplicate = async (req, res, next) => {
    const userId = req.body.userId;
    const result = {
        "success": false,
        "message": ""
    };

    try {
        const userIdData = await psql.query(`
            SELECT id FROM backend.user
            WHERE id=$1
        `, [userId]);

        if (userIdData.rows.length !== 0) {
            throw new Error('이미 존재하는 아이디입니다.');
        }

        next();
    } catch (err) {
        if (err.message === '이미 존재하는 아이디입니다.') {
            fs.unlinkSync(`public/${req.imgPath}`);
        }
        console.log(err);
        result.message = err.message;
        res.send(result);
    }
}

module.exports = idDuplicate;