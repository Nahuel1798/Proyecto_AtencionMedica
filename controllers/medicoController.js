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

exports.nuevoTurnoPage = (req, res) => {
  res.render('nuevoTurno', { medicoId: req.session.medicoId });
};

exports.crearTurno = async (req, res) => {
  const { fecha, hora, motivo, id_paciente, id_estado } = req.body;
  const medicoId = req.session.medicoId;

  const agenda = await turnosModel.obtenerAgendaPorMedico(medicoId);
  if (!agenda) {
    return res.status(400).send('No se encontró una agenda para este médico.');
  }

  const result = await turnosModel.crearTurno(fecha, hora, motivo, agenda.id_agenda, id_paciente, id_estado);

  if (result.affectedRows > 0) {
    res.redirect(`/agenda/${medicoId}`);
  } else {
    res.status(500).send('Error al crear el turno.');
  }
};


