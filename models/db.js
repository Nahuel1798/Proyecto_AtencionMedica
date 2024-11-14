// models/db.js
const mysql = require('mysql2');

// Configuración de la conexión MySQL
const conexion = mysql.createConnection({
  host: process.env.DB_HOST ||'localhost',
  user: process.env.DB_USERNAME || 'root', 
  password: process.env.DB_PASSWORD || '', 
  database: process.env.DB_NAME || 'atencion_medica',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

module.exports = conexion.promise();
