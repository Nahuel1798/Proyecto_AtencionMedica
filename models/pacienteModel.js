// models/pacienteModel.js
const db = require('./db');

module.exports = {
  getPacienteHistorial: async (pacienteId) => {
    const [consulta] = await db.execute(`
      SELECT 
        c.fecha_consulta,
        c.hora_consulta, 
        d.descripcion AS diagnostico, 
        e.resumen_atencion AS evolucion, 
        a.nombre AS alergias, 
        an.descripcion AS antecedentes, 
        h.descripcion AS habitos, 
        m.nombre AS medicamento,
        p.nombre AS paciente_nombre,
        me.nombre AS medico
      FROM consulta c
      LEFT JOIN diagnostico d ON c.id_consulta = d.id_consulta
      LEFT JOIN evolucion e ON c.id_consulta = e.id_consulta
      LEFT JOIN alergia a ON c.id_consulta = a.id_consulta
      LEFT JOIN antecedentes an ON c.id_consulta = an.id_consulta
      LEFT JOIN habito h ON c.id_consulta = h.id_consulta
      LEFT JOIN medicamentos m ON c.id_consulta = m.id_consulta
      LEFT JOIN paciente p ON c.id_paciente = p.id_paciente
      LEFT JOIN turno t ON c.id_turno = t.id_turno
      LEFT JOIN agenda ag ON t.id_agenda = ag.id_agenda
      LEFT JOIN medico me ON ag.id_medico = me.id_medico
      WHERE p.id_paciente = ?
    `, [pacienteId]);

    return consulta;
  },
};
