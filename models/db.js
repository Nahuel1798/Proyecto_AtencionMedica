// models/db.js
const mysql = require('mysql2');

// Configuración de la conexión MySQL
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '', 
  database: process.env.DB_DATABASE || 'atencion_medica',
});

module.exports = pool.promise();
