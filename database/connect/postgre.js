const pg = require("pg");
require('dotenv').config();

const client = new pg.Pool({
    host: process.env.HOST,
    port: process.env.PSQL_PORT,
    user: process.env.PSQL_USER,
    password: process.env.PSQL_PASSWORD,
    database: process.env.PSQL_DATABASE,
    max: process.env.PSQL_MAX
})

// const client = new pg.Pool({
//     host: "localhost",
//     port: 5432,
//     user: "ubuntu",
//     password: 1234,
//     database: "web",
//     max: 3
// })

module.exports = client;