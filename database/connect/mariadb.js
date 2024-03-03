const mariadb = require('mysql');
require('dotenv').config();

// console.log(process.env)
const conn = mariadb.createConnection({
    host: process.env.HOST,
    port: process.env.MYSQL_PORT,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE,
});

module.exports = conn;