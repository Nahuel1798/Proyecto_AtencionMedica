//models/consultaModel.js
const db = require('./db');

module.exports = {
  //Obtener consulta por turnoId y pacienteId
  obtenerTurno: async (turnoId, pacienteId) => {
    const [result] = await db.execute(`
      SELECT t.id_turno, t.fecha_turno, t.hora_turno, et.descripcion, p.id_paciente, p.nombre, p.apellido
      FROM turno t
      JOIN paciente p ON t.id_paciente = p.id_paciente
      JOIN estado_turno et ON t.id_estado = et.id_estado
      WHERE t.id_turno = ? AND t.id_paciente = ?
    `, [turnoId, pacienteId]);

    // Si no hay resultados, retornamos null
    if (result.length === 0) {
      return null;
    }

    return result[0];  // Devolvemos el primer (y único) registro
  },

  //Guardar consulta en la base de datos
  guardarConsulta: async (turnoId, pacienteId) => {
      const [result] = await db.execute(`
          INSERT INTO consulta (fecha_consulta, hora_consulta, estado_consulta, id_turno, id_paciente)
          VALUES ( CURRENT_DATE(), CURRENT_TIME(), '1', ?, ?)
          ORDER BY id_consulta DESC
      `, [turnoId, pacienteId]);

      return result;
  },

  

  // Función para cancelar la consulta
  cancelarConsulta: async (turnoId) => {
    await db.execute(`
      UPDATE turno
      SET estado = 3
      WHERE id_turno = ?
    `, [turnoId]);
  },

  // Tipo Diagnostico
  obtenerTiposDiagnostico: async () => {
    const [result] = await db.execute(`
      SELECT 
        id_tipo_diagnostico, 
        descripcion 
      FROM 
        tipo_diagnostico;
    `);
    console.log('Tipos de diagnóstico obtenidos:', result);
    return result;
  },

  // Guardar diagnóstico
  guardarDiagnostico: async (diagnostico, tiposDiagnostico, idConsulta) => {
    const [result] = await db.execute(`
        INSERT INTO diagnostico (descripcion, tipo_diagnostico, id_consulta) VALUES (?, ?, ?)
    `, [diagnostico, tiposDiagnostico, idConsulta]);

    return result;
  },

  // Guardar evolución
  guardarEvolucion: async (fecha_evolucion, evolucion, idConsulta) => {
      const [result] = await db.execute(`
          INSERT INTO evolucion (fecha_evolucion, resumen_atencion, id_consulta) VALUES (?, ?, ?)
      `, [fecha_evolucion, evolucion, idConsulta]);

      return result;
  },

  //Seleccionar importancia de alergia
  obtenerImportanciaAlergia: async () => {
    const [result] = await db.execute(`
      SELECT 
        id_importancia, 
        nomenclatura 
      FROM 
        importancia_alergia;
    `);
    console.log('Importancias obtenidas:', result);
    return result;
  },

  //Obtener tipos de alergias
  obtenerTiposAlergias: async () => {
    const [result] = await db.execute(`
      SELECT 
        id_tipo_alergia, 
        descripcion 
      FROM 
        tipo_alergia;
    `);
    console.log('Tipos de alergias obtenidos:', result);
    return result;
  },

  // Guardar alergias
  guardarAlergias: async (tipos_alergias, alergia_fecha_desde, alergia_fecha_hasta, idConsulta, importanciaAlergia) => {
      const [result] = await db.execute(`
          INSERT INTO alergia (tipo_alergia, fecha_desde, fecha_hasta, id_consulta, importancia ) VALUES (?, ?, ?, ?, ?)
      `, [tipos_alergias, alergia_fecha_desde, alergia_fecha_hasta, idConsulta, importanciaAlergia]);

      return result;
  },

  // Guardar antecedentes
  guardarAntecedentes: async (antecedentes, fecha_desde_antecedentes, fecha_hasta_antecedentes, idConsulta) => {
      const [result] = await db.execute(`
          INSERT INTO antecedentes (descripcion, fecha_desde, fecha_hasta, id_consulta) VALUES (?, ?, ?, ?)
      `, [antecedentes, fecha_desde_antecedentes, fecha_hasta_antecedentes, idConsulta]);

      return result;
  },

  // Guardar habito
  guardarHabitos: async (habitos, fecha_desde_habitos, fecha_hasta_habitos, idConsulta) => {
      const [result] = await db.execute(`
          INSERT INTO habito (descripcion, fecha_desde, fecha_hasta, id_consulta) VALUES (?, ?, ?, ?)
      `, [habitos, fecha_desde_habitos, fecha_hasta_habitos, idConsulta]);

      return result;
  },

  // Guardar medicamentos
  guardarMedicamentos: async (medicamentos, medicamentos_dosis, medicamentos_frecuencia, idConsulta) => {
      const [result] = await db.execute(`
          INSERT INTO medicamentos (nombre, dosis , frecuencia, id_consulta) VALUES (?, ?, ?, ?)
      `, [medicamentos, medicamentos_dosis, medicamentos_frecuencia, idConsulta]);

      return result;
  },

  // Marcar consulta como atendida
  marcarConsultaAtendida: async (turnoId) => {
      const [result] = await db.execute(`
          UPDATE turno SET id_estado = 2 WHERE id_turno = ?
      `, [turnoId]);

      return result;
  }
};