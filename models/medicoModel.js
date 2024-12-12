// models/medicoModel.js
const db = require('./db');

module.exports = {
  getMedicoByEmail: async (email, password) => {
    const [rows] = await db.execute('SELECT * FROM medico WHERE email = ? AND contraseña = ?', [email, password]);
    return rows;
  },
};

