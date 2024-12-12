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
        a.tipo_alergia AS alergias, 
        an.descripcion AS antecedentes, 
        h.descripcion AS habitos, 
        m.nombre AS medicamento,
        p.nombre AS paciente_nombre,
        me.nombre AS medico,
        c.id_consulta
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
      ORDER BY c.fecha_consulta , c.hora_consulta DESC
    `, [pacienteId]);

    return consulta;
  },

  //obtener historial clinico de un paciente del medico
  getPacienteHistorialDelMedico: async (pacienteId,medicoId) => {
    const [consulta] = await db.execute(`
      SELECT 
        c.fecha_consulta,
        c.hora_consulta, 
        d.descripcion AS diagnostico, 
        e.resumen_atencion AS evolucion, 
        a.tipo_alergia AS alergias, 
        an.descripcion AS antecedentes, 
        h.descripcion AS habitos, 
        m.nombre AS medicamento,
        p.nombre AS paciente_nombre,
        me.nombre AS medico,
        c.id_consulta
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
      WHERE p.id_paciente = ? and ag.id_medico = ?
      ORDER BY c.fecha_consulta , c.hora_consulta DESC
    `, [pacienteId,medicoId]);

    return consulta;
  },

  //obtener historial clinico de un paciente que no sea del medico
  getPacienteHistorialNoDelMedico: async (pacienteId,medicoId) => {
    const [consulta] = await db.execute(`
      SELECT 
        c.fecha_consulta,
        c.hora_consulta, 
        d.descripcion AS diagnostico, 
        e.resumen_atencion AS evolucion, 
        a.tipo_alergia AS alergias, 
        an.descripcion AS antecedentes, 
        h.descripcion AS habitos, 
        m.nombre AS medicamento,
        p.nombre AS paciente_nombre,
        me.nombre AS medico,
        c.id_consulta
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
      WHERE p.id_paciente = ? and ag.id_medico != ?
      ORDER BY c.fecha_consulta , c.hora_consulta DESC
    `, [pacienteId,medicoId]);

    return consulta;
  },

  getUltimaConsulta: async (consultaId) => {
    const [consultas] = await db.execute(`
      SELECT 
        c.fecha_consulta,
        c.hora_consulta, 
        c.id_paciente,
        d.descripcion AS diagnostico, 
        e.resumen_atencion AS evolucion, 
        a.tipo_alergia AS alergias, 
        an.descripcion AS antecedentes, 
        h.descripcion AS habitos, 
        m.nombre AS medicamento,
        p.nombre AS paciente_nombre,
        p.apellido AS paciente_apellido,
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
      WHERE c.id_consulta = ?
      ORDER BY c.fecha_consulta , c.hora_consulta DESC
    `, [consultaId]);

    return consultas;
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


  // Actualizar Diagnóstico
  actualizarDiagnostico: async (consultaId, diagnostico, tipoDiagnostico) => {
    const [result] = await db.execute(
      'UPDATE diagnostico SET descripcion = ?, tipo_diagnostico = ? WHERE id_consulta = ?'
      , [diagnostico, tipoDiagnostico, consultaId]);
    return result;
  },

  // Actualizar Evolución
  actualizarEvolucion: async (consultaId, evolucion, fechaEvolucion) => {
    const [result] = await db.execute(
      'UPDATE evolucion SET resumen_atencion = ?, fecha_evolucion = ? WHERE id_consulta = ?'
      , [evolucion, fechaEvolucion, consultaId]);

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

  //elegir importancia de alergia
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

  // Actualizar Alergias
  actualizarAlergias: async (consultaId, tipo_alergias, fechaDesde, fechaHasta, importancia) => {
    const [existing] = await db.execute(
      'SELECT * FROM alergia WHERE id_consulta = ?',
      [consultaId]
    );
  
    let result;
    if (existing.length === 0) {
      [result] = await db.execute(
        'INSERT INTO alergia (id_consulta, tipo_alergia, fecha_desde, fecha_hasta, importancia) VALUES (?, ?, ?, ?, ?)',
        [consultaId, tipo_alergias, fechaDesde, fechaHasta, importancia]
      );
    } else {
      [result] = await db.execute(
        'UPDATE alergia SET tipo_alergia = ?, fecha_desde = ?, fecha_hasta = ?, importancia = ? WHERE id_consulta = ?',
        [tipo_alergias, fechaDesde, fechaHasta, importancia, consultaId]
      );
    }
    return result;
  },

  // Actualizar Antecedentes
  actualizarAntecedentes: async (consultaId, antecedentes, fechaDesde, fechaHasta) => {
    const [existing] = await db.execute(
      'SELECT * FROM antecedentes WHERE id_consulta = ?',
      [consultaId]
    );
  
    let result;
    if (existing.length === 0) {
      [result] = await db.execute(
        'INSERT INTO antecedentes (id_consulta, descripcion, fecha_desde, fecha_hasta) VALUES (?, ?, ?, ?)',
        [consultaId, antecedentes, fechaDesde, fechaHasta]
      );
    } else {
      [result] = await db.execute(
        'UPDATE antecedentes SET descripcion = ?, fecha_desde = ?, fecha_hasta = ? WHERE id_consulta = ?',
        [antecedentes, fechaDesde, fechaHasta, consultaId]
      );
    }
    return result;
  },

  // Actualizar Hábitos
  actualizarHabitos: async (consultaId, habitos, fechaDesde, fechaHasta) => {
    const [existing] = await db.execute(
      'SELECT * FROM habito WHERE id_consulta = ?',
      [consultaId]
    );
  
    let result;
    if (existing.length === 0) {
      [result] = await db.execute(
        'INSERT INTO habito (id_consulta, descripcion, fecha_desde, fecha_hasta) VALUES (?, ?, ?, ?)',
        [consultaId, habitos, fechaDesde, fechaHasta]
      );
    } else {
      [result] = await db.execute(
        'UPDATE habito SET descripcion = ?, fecha_desde = ?, fecha_hasta = ? WHERE id_consulta = ?',
        [habitos, fechaDesde, fechaHasta, consultaId]
      );
    }
    return result;
  },

  // Actualizar Medicamentos
  actualizarMedicamentos: async (consultaId, medicamentosNombre, medicamentosDosis, medicamentosFrecuencia) => {
    const [existing] = await db.execute(
      'SELECT * FROM medicamentos WHERE id_consulta = ?',
      [consultaId]
    );
  
    let result;
    if (existing.length === 0) {
      [result] = await db.execute(
        'INSERT INTO medicamentos (id_consulta, nombre, dosis, frecuencia) VALUES (?, ?, ?, ?)',
        [consultaId, medicamentosNombre, medicamentosDosis, medicamentosFrecuencia]
      );
    } else {
      [result] = await db.execute(
        'UPDATE medicamentos SET nombre = ?, dosis = ?, frecuencia = ? WHERE id_consulta = ?',
        [medicamentosNombre, medicamentosDosis, medicamentosFrecuencia, consultaId]
      );
    }
    return result;
  },
};
