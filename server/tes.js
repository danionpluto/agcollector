// server/test-db.js
require('dotenv').config();
const mysql = require('mysql2');

const connection = mysql.createConnection({
    host: '127.0.0.1',
  user: process.env.DB_USER || 'root',
  database: process.env.DB_NAME || 'my_app_db'
});

connection.connect((err) => {
  if (err) {
    console.error('❌ MySQL connection failed:', err.message);
    return;
  }
  console.log('✅ Connected to MySQL!');

  connection.query('SELECT * FROM dolls', (err, results) => {
    if (err) {
      console.error('❌ Query failed:', err.message);
    } else {
      console.log('✅ Query result:', results);
    }
    connection.end();
  });
});
