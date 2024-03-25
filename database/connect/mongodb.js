const { MongoClient } = require('mongodb');
require('dotenv').config();

const uri = process.env.MONGODB_URI;
const connectMongoDB = async () => {
    try {
        const client = await MongoClient.connect(uri, {
            maxPoolSize: process.env.MONGODB_MAX
        });
        console.log('Connected');
        return client.db('backend');
    } catch (err) {
        console.log(err);
        throw err;
    }
}

module.exports = connectMongoDB;

// useNewUrlParser: true, //이전 버전의 url도 파싱하기 위한 옵션
// useUnifiedTopology: true,
//mongodb 드라이버에서 발생할 수 잇는 네트워크 연결 이벤트 처리 관련 문제 해결
//ex) 연결 끊긴 거 대처 잘 ㄴㄴ, 연결 시도 중 문제 감지 잘 ㄴㄴ