// controllers/consultaController.js
const consultaModel = require('../models/consultaModel');

exports.formularioConsulta = async (req, res) => {
  const turnoId = req.params.turnoId;
  const pacienteId = req.params.pacienteId;
  const medicoId = req.params.medicoId;

  console.log(`Buscando historial clínico para el turno con ID: ${turnoId}`);
  console.log(`Buscando historial clínico para el paciente con ID: ${pacienteId}`);
  console.log(`ID del medico: ${medicoId}`);

  try {
    // Obtener detalles del turno
    const turno = await consultaModel.obtenerTurno(turnoId, pacienteId);

    if (!turno) {
      return res.status(404).send('Turno no encontrado');
    }

    const importancias = await consultaModel.obtenerImportanciaAlergia();
    console.log('Importancias obtenidas:', importancias);
    
    // Renderizar la vista del formulario con los detalles del turno
    res.render('consulta', { turno: turno, importancias: importancias, medicoId: medicoId });
  } catch (error) {
    console.error('Error al cargar el formulario:', error);
    res.status(500).send('Error al cargar el formulario');
  }
};

// Guardar consulta en la base de datos
exports.guardarConsulta = async (req, res) => {
  const turnoId = req.params.turnoId;
  const pacienteId = req.params.pacienteId;
  const medicoId = req.params.medicoId;
  const { 
    diagnostico, tipo_diagnostico, evolucion, fecha_evolucion, alergias, importancia_alergia, antecedentes, 
    fecha_desde_antecedentes, fecha_hasta_antecedentes, habitos, fecha_desde_habitos, fecha_hasta_habitos, medicamentos_nombre,
    medicamentos_dosis, medicamentos_frecuencia,alergia_fecha_desde, alergia_fecha_hasta} = req.body;

  console.log('Datos de diagnóstico:', { diagnostico, tipo_diagnostico, medicoId });

  try {
    // Paso 1: Guardar los datos de la consulta
    const consultaResult = await consultaModel.guardarConsulta(turnoId, pacienteId);

    // Paso 2: Guardar dignóstico
    await consultaModel.guardarDiagnostico(consultaResult.insertId, diagnostico, tipo_diagnostico);

    // Paso 3: Guardar la evolución
    await consultaModel.guardarEvolucion(consultaResult.insertId, evolucion, fecha_evolucion);

    // Paso 4: Guardar alergias
    if (alergias) {
      await consultaModel.guardarAlergias(consultaResult.insertId, alergias, alergia_fecha_desde, alergia_fecha_hasta, importancia_alergia);
    }

    // Paso 5: Guardar antecedentes
    if (antecedentes) {
      await consultaModel.guardarAntecedentes(consultaResult.insertId, antecedentes, fecha_desde_antecedentes, fecha_hasta_antecedentes);
    }

    // Paso 6: Guardar habito
    if (habitos) {
      await consultaModel.guardarHabitos(consultaResult.insertId, habitos, fecha_desde_habitos, fecha_hasta_habitos);
    }

    // Paso 7: Guardar medicamentos
    if (medicamentos_nombre) {
      await consultaModel.guardarMedicamentos(consultaResult.insertId, medicamentos_nombre, medicamentos_dosis, medicamentos_frecuencia);
    }

    // Paso final: Marcar el turno como atendido
    await consultaModel.marcarConsultaAtendida(turnoId);

    // Volver a obtener detalles del turno y las importancias, necesarios para la vista de consulta
    const turno = await consultaModel.obtenerTurno(turnoId, pacienteId);
    const importancias = await consultaModel.obtenerImportanciaAlergia();

    // Renderizar la vista con el mensaje de éxito y los datos necesarios
    res.render('consulta', {
      successMessage: 'Consulta guardada exitosamente',
      turno: turno,
      importancias: importancias,
      medicoId: medicoId
    });
    
  } catch (error) {
    console.error('Error al guardar la consulta:', error);
    res.status(500).send('Error al guardar la consulta');
  }
};

// Cancelar consulta
exports.cancelarConsulta = async (req, res) => {
  const turnoId = req.params.turnoId;
  const pacienteId = req.params.pacienteId;

  try {
    // Actualizar el estado de la consulta a "Cancelado"
    await consultaModel.cancelarConsulta(turnoId);

    // Redirigir a la agenda o al historial con un mensaje de éxito
    res.redirect(`/agenda/${req.session.medicoId}`);
  } catch (error) {
    console.error('Error al cancelar la consulta:', error);
    res.status(500).send('Error al cancelar la consulta');
  }
};


