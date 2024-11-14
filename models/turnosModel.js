const db = require('./db');

module.exports = {
  getTurnos: async (medicoId,fecha) => {
    const [turnos] = await db.execute(`
        SELECT 
          t.id_turno, 
          t.fecha_turno, 
          t.hora_turno,
          et.descripcion AS estado,
          p.id_paciente,
          p.nombre AS paciente_nombre, 
          m.nombre AS medico_nombre 
        FROM turno t 
        JOIN estado_turno et ON t.id_estado = et.id_estado
        LEFT JOIN paciente p ON t.id_paciente = p.id_paciente 
        JOIN agenda a ON t.id_agenda = a.id_agenda
        JOIN medico m ON a.id_medico = m.id_medico  
        WHERE m.id_medico = ? AND t.fecha_turno = ?
        ORDER BY t.fecha_turno ASC
      `, [medicoId,fecha]);

    return turnos;
  },

  marcarConsultaAtendida: async (turnoId) => {
    const [result] = await db.execute(`
      UPDATE turno
      SET estado = '2'
      WHERE id_turno = ?
    `, [turnoId]);

    return result;
  },
};
