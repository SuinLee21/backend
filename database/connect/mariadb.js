const mariadb = require('mysql');

const conn = mariadb.createConnection({
    host: 'localhost',
    port: 3306,
    user: 'suin',
    password: 'suin',
    database: 'web'
});

module.exports = conn;