const schedule = require("node-schedule");
const redis = require("redis").createClient();
const psql = require("../../database/connect/postgre");

const scheduler = schedule.scheduleJob('0 0 0 * * *', async () => {
    try {
        await redis.connect();

        const loginCount = await redis.hGet('todayLoginCount', 'count');

        await psql.query(`
            UPDATE backend.login_count
            SET count=count+${parseInt(loginCount)}
        `)

        await redis.zRemRangeByLex("todayLoginHistory", "-", "+");
        await redis.del('todayLoginCount');
    } catch (err) {
        console.log(err);
    } finally {
        redis.disconnect();
    }
});

module.exports = scheduler;