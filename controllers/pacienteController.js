// controllers/pacienteController.js
const pacienteModel = require('../models/pacienteModel');
const templateModel = require('../models/templateModel');

exports.historialClinico = async (req, res) => {
  const pacienteId = req.params.pacienteId;
  const medicoId = req.session.medicoId;
  console.log(`Buscando historial clínico para el medico con ID: ${medicoId}`);
  console.log(`Buscando historial clínico para el paciente con ID: ${pacienteId}`);

  // Obtener los datos del historial clínico
  const consultas = await pacienteModel.getPacienteHistorial(pacienteId);
  console.log('Datos obtenidos:', consultas);
  const consultasDelMedico = await pacienteModel.getPacienteHistorialDelMedico(pacienteId, medicoId);
  const consultasNoDelMedico = await pacienteModel.getPacienteHistorialNoDelMedico(pacienteId, medicoId);
  console.log('Datos obtenidos:', consultasDelMedico);


  // Formatear la fecha de cada consulta
  const consultaFormateada = consultas.map(item => {
    const fechaConsulta = new Date(item.fecha_consulta);  // Cambiar "fecha_consulta" según el nombre del campo en tu base de datos
    const dia = String(fechaConsulta.getDate()).padStart(2, '0');
    const mes = String(fechaConsulta.getMonth() + 1).padStart(2, '0');
    const anio = fechaConsulta.getFullYear();
    const fechaFormateada = `${dia}/${mes}/${anio}`;

    // Retornar el objeto original con la fecha formateada
    return { ...item, fecha_consulta: fechaFormateada };
  });

  const formconsultasDelMedico = consultasDelMedico.map(item => {
    const fechaConsulta = new Date(item.fecha_consulta);  // Cambiar "fecha_consulta" según el nombre del campo en tu base de datos
    const dia = String(fechaConsulta.getDate()).padStart(2, '0');
    const mes = String(fechaConsulta.getMonth() + 1).padStart(2, '0');
    const anio = fechaConsulta.getFullYear();
    const fechaFormateada = `${dia}/${mes}/${anio}`;

    // Retornar el objeto original con la fecha formateada
    return { ...item, fecha_consulta: fechaFormateada };
  });

  const formconsultasNoDelMedico = consultasNoDelMedico.map(item => {
    const fechaConsulta = new Date(item.fecha_consulta);  // Cambiar "fecha_consulta" según el nombre del campo en tu base de datos
    const dia = String(fechaConsulta.getDate()).padStart(2, '0');
    const mes = String(fechaConsulta.getMonth() + 1).padStart(2, '0');
    const anio = fechaConsulta.getFullYear();
    const fechaFormateada = `${dia}/${mes}/${anio}`;

    // Retornar el objeto original con la fecha formateada
    return { ...item, fecha_consulta: fechaFormateada };
  });

  // Obtener la última consulta
  const ultimaConsulta = formconsultasDelMedico[0] || null; // Suponiendo que las consultas están ordenadas por fecha DESC
  const medicoConsulta = formconsultasDelMedico;
  const medicoNoConsulta = formconsultasNoDelMedico;

  // Filtrar consultas atendidas por otros médicos
  

  res.render('historialClinico', {
    consulta: consultaFormateada,
    consultasDelMedico,
    consultasNoDelMedico,
    medicoConsulta,
    medicoNoConsulta,
    ultimaConsulta,
    pacienteId,
  });
};

// Función para renderizar el formulario de modificación de la última consulta
exports.modificarConsulta = async (req, res) => {
  const consultaId = req.params.consultaId; // ID de la consulta a modificar
  console.log(`mostrar consultaId: ${consultaId}`);


  try {
    const consultas = await pacienteModel.getUltimaConsulta(consultaId); // Obtener los datos de la consulta
    const templates = await templateModel.obtenerTemplatesPorMedico(req.session.medicoId);
    console.log('Consulta obtenida:', consultas);

    const importancias = await pacienteModel.obtenerImportanciaAlergia();
    console.log('Importancias obtenidas:', importancias);

    const tiposAlergias = await pacienteModel.obtenerTiposAlergias();
    console.log('Tipos de alergias obtenidos:', tiposAlergias);

    const tiposDiagnostico = await pacienteModel.obtenerTiposDiagnostico();
    console.log('Tipos de diagnóstico obtenidos:', tiposDiagnostico);

    if (!consultas) {
      return res.status(404).render('modificarConsulta', {
        errorMessage: 'La consulta no fue encontrada.',
        consultas: null,
      });
    }
    
    res.render('modificarConsulta',{consultas: consultas[0], importancias: importancias, tiposAlergias: tiposAlergias, tiposDiagnostico: tiposDiagnostico, consultaId: consultaId, templates: templates}); 
  } catch (error) {
    console.error('Error al cargar el formulario:', error);
    res.status(500).send('Error al cargar el formulario');
  }
};

// Función para manejar la actualización de la consulta
exports.actualizarConsulta = async (req, res) => {
  const consultaId = req.params.consultaId; // ID de la consulta a modificar
  console.log(`ID de la consulta: ${consultaId}`);


  // Desestructuramos los datos enviados desde el formulario
  const {
    diagnostico, tipo_diagnostico, evolucion, fecha_evolucion, tipos_alergias, importancia_alergia,
    antecedentes, fecha_desde_antecedentes, fecha_hasta_antecedentes, habitos,
    fecha_desde_habitos, fecha_hasta_habitos, medicamentos_nombre, medicamentos_dosis,
    medicamentos_frecuencia, alergia_fecha_desde,
    alergia_fecha_hasta,
  } = req.body;

  try {

    const templates = await templateModel.obtenerTemplatesPorMedico(req.session.medicoId);

    // Paso 1: Actualizar el diagnóstico
    await pacienteModel.actualizarDiagnostico(consultaId, diagnostico, tipo_diagnostico);

    // Paso 2: Actualizar la evolución, si corresponde
    if (evolucion && fecha_evolucion) {
      await pacienteModel.actualizarEvolucion(consultaId, evolucion, fecha_evolucion);
    }

    // Paso 3: Actualizar las alergias
    if (tipos_alergias) {
      await pacienteModel.actualizarAlergias(
        consultaId, tipos_alergias, alergia_fecha_desde, alergia_fecha_hasta, importancia_alergia);
    }

    // Paso 4: Actualizar antecedentes
    if (antecedentes) {
      await pacienteModel.actualizarAntecedentes(consultaId, antecedentes, fecha_desde_antecedentes, fecha_hasta_antecedentes);
    }

    // Paso 5: Actualizar hábitos
    if (habitos) {
      await pacienteModel.actualizarHabitos(consultaId, habitos, fecha_desde_habitos, fecha_hasta_habitos
      );
    }

    // Paso 6: Actualizar medicamentos
    if (medicamentos_nombre) {
      await pacienteModel.actualizarMedicamentos(
        consultaId,
        medicamentos_nombre,
        medicamentos_dosis,
        medicamentos_frecuencia
      );
    }

    // Obtener la consulta actualizada
    const consultas = await pacienteModel.getUltimaConsulta(consultaId);
    console.log('Consulta obtenida:', consultas);
    const importancias = await pacienteModel.obtenerImportanciaAlergia();
    const tiposAlergias = await pacienteModel.obtenerTiposAlergias();
    const tiposDiagnostico = await pacienteModel.obtenerTiposDiagnostico();
    console.log('Tipos de diagnóstico obtenidos:', tiposDiagnostico);

    // Renderizamos la vista de modificación con un mensaje de éxito
    res.render('modificarConsulta', {
      successMessage: 'La consulta fue actualizada exitosamente.',
      importancias: importancias,
      tiposAlergias: tiposAlergias,
      tiposDiagnostico: tiposDiagnostico,
      templates: templates,
      consultas: consultas[0]
    });
  } catch (error) {
    console.error('Error al actualizar la consulta:', error);

    res.status(500).render('modificarConsulta', {
      errorMessage: 'Hubo un error al intentar actualizar la consulta. Por favor, intente nuevamente.',
      consulta: {},
      importancias: await pacienteModel.obtenerImportanciaAlergia(),
    });
  }
};
