// controllers/consultaController.js
const consultaModel = require('../models/consultaModel');
const templateModel = require('../models/templateModel');

exports.formularioConsulta = async (req, res) => {
  const turnoId = req.params.turnoId;
  const pacienteId = req.params.pacienteId;
  const medicoId = req.session.medicoId;

  console.log(`Buscando historial clínico para el turno con ID: ${turnoId}`);
  console.log(`Buscando historial clínico para el paciente con ID: ${pacienteId}`);
  console.log(`ID del medico: ${medicoId}`);

  try {
    // Obtener detalles del turno
    const turno = await consultaModel.obtenerTurno(turnoId, pacienteId);
    const templates = await templateModel.obtenerTemplatesPorMedico(medicoId);
    console.log('templates obtenidos:', templates);

    if (!turno) {
      return res.status(404).send('Turno no encontrado');
    }

    const tiposDiagnostico = await consultaModel.obtenerTiposDiagnostico();
    console.log('Tipos de diagnóstico obtenidos:', tiposDiagnostico);

    const importancias = await consultaModel.obtenerImportanciaAlergia();
    console.log('Importancias obtenidas:', importancias);

    const tiposAlergias = await consultaModel.obtenerTiposAlergias();
    console.log('Tipos de alergias obtenidos:', tiposAlergias);
    
    // Renderizar la vista del formulario con los detalles del turno
    res.render('consulta', { turno: turno, importancias: importancias, medicoId: medicoId, tiposDiagnostico: tiposDiagnostico, tiposAlergias: tiposAlergias, templates: templates });
  } catch (error) {
    console.error('Error al cargar el formulario:', error);
    res.status(500).send('Error al cargar el formulario');
  }
};


// Guardar consulta en la base de datos
exports.guardarConsulta = async (req, res) => {
  const turnoId = req.params.turnoId;
  const pacienteId = req.params.pacienteId;
  const medicoId = req.session.medicoId;
  const { 
    diagnostico, tipo_diagnostico, evolucion, fecha_evolucion, importancia_alergia, tipos_alergias, antecedentes, 
    fecha_desde_antecedentes, fecha_hasta_antecedentes, habitos, fecha_desde_habitos, fecha_hasta_habitos, medicamentos_nombre,
    medicamentos_dosis, medicamentos_frecuencia,alergia_fecha_desde, alergia_fecha_hasta} = req.body;

  console.log('Datos de diagnóstico:', { diagnostico, tipo_diagnostico, medicoId });

  try {
    // Paso 1: Guardar los datos de la consulta
    const consultaResult = await consultaModel.guardarConsulta(turnoId, pacienteId);

    // Paso 2: Guardar dignóstico
    await consultaModel.guardarDiagnostico(diagnostico, tipo_diagnostico, consultaResult.insertId);

    // Paso 3: Guardar la evolución
    if (evolucion && fecha_evolucion) {
      await consultaModel.guardarEvolucion(fecha_evolucion, evolucion, consultaResult.insertId);
    }

    // Paso 4: Guardar alergias
    if (tipos_alergias) {
      await consultaModel.guardarAlergias(tipos_alergias, alergia_fecha_desde, alergia_fecha_hasta, consultaResult.insertId, importancia_alergia);
    }

    // Paso 5: Guardar antecedentes
    if (antecedentes) {
      await consultaModel.guardarAntecedentes(antecedentes, fecha_desde_antecedentes, fecha_hasta_antecedentes, consultaResult.insertId);
    }

    // Paso 6: Guardar habito
    if (habitos) {
      await consultaModel.guardarHabitos(habitos, fecha_desde_habitos, fecha_hasta_habitos, consultaResult.insertId);
    }

    // Paso 7: Guardar medicamentos
    if (medicamentos_nombre) {
      await consultaModel.guardarMedicamentos(medicamentos_nombre, medicamentos_dosis, medicamentos_frecuencia, consultaResult.insertId);
    }

    // Paso final: Marcar el turno como atendido
    await consultaModel.marcarConsultaAtendida(turnoId);

    // Volver a obtener detalles del turno y las importancias, necesarios para la vista de consulta
    const turno = await consultaModel.obtenerTurno(turnoId, pacienteId);
    const importancias = await consultaModel.obtenerImportanciaAlergia();
    const tiposAlergias = await consultaModel.obtenerTiposAlergias();
    const tiposDiagnostico = await consultaModel.obtenerTiposDiagnostico();
    const templates = await templateModel.obtenerTemplatesPorMedico(medicoId);
    console.log('Consulta obtenida:', consultaResult);

    // Renderizar la vista con el mensaje de éxito y los datos necesarios
    res.render('consulta', {
      successMessage: 'Consulta guardada exitosamente',
      turno: turno,
      importancias: importancias,
      medicoId: medicoId,
      tiposAlergias: tiposAlergias,
      tiposDiagnostico: tiposDiagnostico,
      consultaResult : consultaResult,
      templates: templates
    });
    
  } catch (error) {
    console.error('Error al guardar la consulta:', error);
    res.status(500).send('Error al guardar la consulta');
  }
};


