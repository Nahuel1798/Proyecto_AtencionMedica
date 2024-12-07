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
      ORDER BY c.fecha_consulta DESC
    `, [pacienteId]);

    return consulta;
  },

  getUltimaConsulta: async (consultaId) => {
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
      WHERE c.id_consulta = ?
    `, [consultaId]);

    return consulta;
  },

  // Actualizar Diagnóstico
  actualizarDiagnostico: async (consultaId, diagnostico, tipoDiagnostico) => {
    // Primero, verifica si ya existe un diagnóstico para esta consulta
    const [existing] = await db.execute(
      'SELECT * FROM diagnostico WHERE id_consulta = ?',
      [consultaId]
    );

    if (existing.length > 0) {
      // Actualizar el diagnóstico existente
      await db.execute(
        'UPDATE diagnostico SET descripcion = ?, tipo_diagnostico = ? WHERE id_consulta = ?',
        [diagnostico, tipoDiagnostico, consultaId]
      );
    } else {
      // Insertar un nuevo diagnóstico
      await db.execute(
        'INSERT INTO diagnostico (id_consulta, descripcion, tipo_diagnostico) VALUES (?, ?, ?)',
        [consultaId, diagnostico, tipoDiagnostico]
      );
    }
  },

  // Actualizar Evolución
  actualizarEvolucion: async (consultaId, evolucion, fechaEvolucion) => {
    const [existing] = await db.execute(
      'SELECT * FROM evolucion WHERE id_consulta = ?',
      [consultaId]
    );

    if (existing.length > 0) {
      await db.execute(
        'UPDATE evolucion SET fecha_evolucion = ?, resumen_atencion = ? WHERE id_consulta = ?',
        [fechaEvolucion, evolucion,  consultaId]
      );
    } else {
      await db.execute(
        'INSERT INTO evolucion (id_consulta, resumen_atencion, fecha_evolucion) VALUES (?, ?, ?)',
        [consultaId, evolucion, fechaEvolucion]
      );
    }
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
  actualizarAlergias: async (consultaId, alergias, fechaDesde, fechaHasta, importancia) => {
    const [existing] = await db.execute(
      'SELECT * FROM alergia WHERE id_consulta = ?',
      [consultaId]
    );

    if (existing.length > 0) {
      await db.execute(
        'UPDATE alergia SET nombre = ?, fecha_desde = ?, fecha_hasta = ?, importancia = ? WHERE id_consulta = ?',
        [alergias, fechaDesde, fechaHasta, importancia, consultaId]
      );
    } else {
      await db.execute(
        'INSERT INTO alergia (id_consulta, nombre, fecha_desde, fecha_hasta, importancia) VALUES (?, ?, ?, ?, ?)',
        [consultaId, alergias, fechaDesde, fechaHasta, importancia]
      );
    }
  },

  // Actualizar Antecedentes
  actualizarAntecedentes: async (consultaId, antecedentes, fechaDesde, fechaHasta) => {
    const [existing] = await db.execute(
      'SELECT * FROM antecedentes WHERE id_consulta = ?',
      [consultaId]
    );

    if (existing.length > 0) {
      await db.execute(
        'UPDATE antecedentes SET descripcion = ?, fecha_desde = ?, fecha_hasta = ? WHERE id_consulta = ?',
        [antecedentes, fechaDesde, fechaHasta, consultaId]
      );
    } else {
      await db.execute(
        'INSERT INTO antecedentes (id_consulta, descripcion, fecha_desde, fecha_hasta) VALUES (?, ?, ?, ?)',
        [consultaId, antecedentes, fechaDesde, fechaHasta]
      );
    }
  },

  // Actualizar Hábitos
  actualizarHabitos: async (consultaId, habitos, fechaDesde, fechaHasta) => {
    const [existing] = await db.execute(
      'SELECT * FROM habito WHERE id_consulta = ?',
      [consultaId]
    );

    if (existing.length > 0) {
      await db.execute(
        'UPDATE habito SET descripcion = ?, fecha_desde = ?, fecha_hasta = ? WHERE id_consulta = ?',
        [habitos, fechaDesde, fechaHasta, consultaId]
      );
    } else {
      await db.execute(
        'INSERT INTO habito (id_consulta, descripcion, fecha_desde, fecha_hasta) VALUES (?, ?, ?, ?)',
        [consultaId, habitos, fechaDesde, fechaHasta]
      );
    }
  },

  // Actualizar Medicamentos
  actualizarMedicamentos: async (consultaId, medicamentosNombre, medicamentosDosis, medicamentosFrecuencia) => {
    const [existing] = await db.execute(
      'SELECT * FROM medicamentos WHERE id_consulta = ?',
      [consultaId]
    );

    if (existing.length > 0) {
      await db.execute(
        'UPDATE medicamentos SET nombre = ?, dosis = ?, frecuencia = ? WHERE id_consulta = ?',
        [medicamentosNombre, medicamentosDosis, medicamentosFrecuencia, consultaId]
      );
    } else {
      await db.execute(
        'INSERT INTO medicamentos (id_consulta, nombre, dosis, frecuencia) VALUES (?, ?, ?, ?)',
        [consultaId, medicamentosNombre, medicamentosDosis, medicamentosFrecuencia]
      );
    }
  },
};
