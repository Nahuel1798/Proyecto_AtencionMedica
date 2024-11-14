// models/db.js
const mysql = require('mysql2');

// Configuración de la conexión MySQL
const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '', 
  database: 'atencion_medica',
});

module.exports = pool.promise();
