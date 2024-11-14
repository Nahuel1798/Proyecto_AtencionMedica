const db = require('../models/db');
const turnosModel = require('../models/turnosModel');

exports.loginPage = (req, res) => {
  res.render('login');
};

exports.login = async (req, res) => {
  const { email, password } = req.body;

  // Verificar la existencia del médico en la base de datos
  const [rows] = await db.execute('SELECT * FROM medico WHERE email = ? AND contraseña = ?', [email, password]);

  if (rows.length > 0) {
    // Crear una sesión para el médico
    req.session.medicoId = rows[0].id_medico;
    res.redirect(`/agenda/${rows[0].id_medico}`);
  } else {
    res.render('login', { message: 'Usuario o contraseña incorrectas' });
  }
};

exports.isAuthenticated = (req, res, next) => {
  if (req.session.medicoId) {
    // Continuar si el médico está autenticado
    next();
  } else {
    // Redirigir a la página de inicio de sesión si no está autenticado
    res.redirect('/login');
  }
};

exports.cancelarTurnosPasados = async () => {
  const fechaActual = new Date().toISOString().split('T')[0]; // Fecha de hoy en formato yyyy-MM-dd
  await db.execute('UPDATE turno SET id_estado = 3 WHERE fecha_turno < ? AND id_estado = 1', [fechaActual]);
};

exports.agenda = async (req, res) => {
  const medicoId = req.params.medicoId;
  const fechaSeleccionada = req.query.fecha || new Date().toISOString().split('T')[0]; // Fecha de hoy en formato yyyy-MM-dd

  console.log(`Buscando turnos para el turno con ID: ${medicoId} y fecha: ${fechaSeleccionada}`);
  
  // Llama a la función para cancelar los turnos pasados
  await this.cancelarTurnosPasados();

  // Obtener los datos de los turnos
  const turnos = await turnosModel.getTurnos(medicoId, fechaSeleccionada);
  console.log('Datos obtenidos:', turnos);

  // Si no hay turnos, establecer noTurnos en true
  const noTurnos = !turnos || turnos.length === 0;

  // Formatear la fecha de cada turno antes de enviarlo a la vista
  const turnosFormateados = turnos.map(turno => {
    const fecha = new Date(turno.fecha_turno);
    const dia = String(fecha.getDate()).padStart(2, '0');
    const mes = String(fecha.getMonth() + 1).padStart(2, '0'); // Los meses comienzan desde 0
    const anio = fecha.getFullYear();

    return {
      ...turno,
      fecha_turno: `${dia}/${mes}/${anio}`, // Formato dd/MM/yyyy
    };
  });

  res.render('agenda', {
    turnos: turnosFormateados,
    fechaSeleccionada,
    medicoId,
    noTurnos,
    message: noTurnos ? 'No se encontraron datos de la agenda.' : null
  });
};

exports.realizarConsulta = async (req, res) => {
  const turnoId = req.params.turnoId;

  // Actualizar el estado del turno a "Atendido"
  const result = await turnosModel.marcarConsultaAtendida(turnoId);

  if (result.affectedRows > 0) {
    // Redirigir de vuelta a la agenda con el estado actualizado
    res.redirect('/agenda');
  } else {
    // Si hubo un error al actualizar, mostrar un mensaje
    res.status(500).send('Error al marcar el turno como atendido.');
  }
};
