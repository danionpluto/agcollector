// server/db.js
require('dotenv').config();
// console.log('DB_HOST:', process.env.DB_HOST);

// const mysql = require('mysql2/promise');

// const pool = mysql.createPool({
//   host: process.env.DB_HOST,
//   user: process.env.DB_USER,
//   password: process.env.DB_PASSWORD,
//   database: process.env.DB_NAME
// });

// pool.getConnection((err, connection) => {
//   if (err) {
//     console.error('MySQL connection error:', err);
//   } else {
//     console.log('MySQL connected!');
//     connection.release();
//   }
// });


// module.exports = pool.promise();

const mysql = require('mysql2/promise');
console.log('Connecting to DB host:', process.env.DB_HOST);

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

module.exports = pool;
