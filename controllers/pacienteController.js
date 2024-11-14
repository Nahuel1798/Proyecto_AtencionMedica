// controllers/pacienteController.js
const pacienteModel = require('../models/pacienteModel');

exports.historialClinico = async (req, res) => {
  const pacienteId = req.params.pacienteId;

  console.log(`Buscando historial clínico para el turno con ID: ${pacienteId}`);
  console.log(`Buscando historial clínico para el paciente con ID: ${pacienteId}`);

  // Obtener los datos del historial clínico
  const consultas = await pacienteModel.getPacienteHistorial(pacienteId);
  console.log('Datos obtenidos:', consultas);

  // Si no hay datos, mostrar un mensaje de error
  if (!consultas || consultas.length === 0) {
    return res.render('historialClinico', { message: 'No se encontraron datos del historial clínico.' });
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

  res.render('historialClinico', { consulta: consultaFormateada });
};

