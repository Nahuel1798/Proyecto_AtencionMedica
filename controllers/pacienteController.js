// controllers/pacienteController.js
const pacienteModel = require('../models/pacienteModel');

exports.historialClinico = async (req, res) => {
  const pacienteId = req.params.pacienteId;
  console.log(`Buscando historial clínico para el paciente con ID: ${pacienteId}`);

  // Obtener los datos del historial clínico
  const consultas = await pacienteModel.getPacienteHistorial(pacienteId);
  console.log('Datos obtenidos:', consultas);

  if (!consultas || consultas.length === 0) {
    return res.render('historialClinico', { 
      consulta: [], 
      ultimaConsulta: null, 
      consultasOtrosMedicos: [] 
    });
  }

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

  // Obtener la última consulta
  const ultimaConsulta = consultaFormateada[0]; // Suponiendo que las consultas están ordenadas por fecha DESC

  // Filtrar consultas atendidas por otros médicos
  const consultasOtrosMedicos = consultaFormateada.filter(item => item.medico !== ultimaConsulta.medico);

  res.render('historialClinico', {
    consulta: consultaFormateada,
    ultimaConsulta,
    consultasOtrosMedicos,
    pacienteId
  });
};

// Función para renderizar el formulario de modificación de la última consulta
exports.modificarConsulta = async (req, res) => {
  const consultaId = req.params.consultaId; // ID de la consulta a modificar
  const pacienteId = req.params.pacienteId;
  console.log(`mostrar consultaId: ${consultaId}`);
  console.log(`mostrar pacienteId: ${pacienteId}`);

  try {
    const consultas = await pacienteModel.getUltimaConsulta(consultaId); // Obtener los datos de la consulta
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
    
    res.render('modificarConsulta',{consultas: consultas, importancias: importancias, tiposAlergias: tiposAlergias, tiposDiagnostico: tiposDiagnostico, consultaId: consultaId, pacienteId: pacienteId}); 
  } catch (error) {
    console.error('Error al cargar el formulario:', error);
    res.status(500).send('Error al cargar el formulario');
  }
};

// Función para manejar la actualización de la consulta
exports.actualizarConsulta = async (req, res) => {
  const consultaId = req.params.consultaId; // ID de la consulta a modificar
  const pacienteId = req.params.pacienteId;
  console.log(`ID de la consulta: ${consultaId}`);
  console.log(`ID del paciente: ${pacienteId}`);

  // Desestructuramos los datos enviados desde el formulario
  const {
    diagnostico, tipo_diagnostico, evolucion, fecha_evolucion, tipos_alergias, importancia_alergia,
    antecedentes, fecha_desde_antecedentes, fecha_hasta_antecedentes, habitos,
    fecha_desde_habitos, fecha_hasta_habitos, medicamentos_nombre, medicamentos_dosis,
    medicamentos_frecuencia, alergia_fecha_desde,
    alergia_fecha_hasta,
  } = req.body;

  try {
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
      consultas: consultas
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
