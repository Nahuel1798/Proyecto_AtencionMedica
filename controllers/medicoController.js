//controllers/medicoController.js
const db = require('../models/db');
const turnosModel = require('../models/turnosModel');
const bcrypt = require('bcrypt');

exports.loginPage = (req, res) => {
  res.render('login');
};

exports.signupPage = (req, res) => {
  res.render('signup');
};

// Registro de usuario
exports.signup = async (req, res) => {
  const { email, password, nombre, especialidad } = req.body;

  if (!email || !password || !nombre || !especialidad) {
    return res.status(400).send({ error: 'Todos los campos son requeridos.' });
  }

  // Verificar si el usuario ya existe
  const [existingUser] = await db.execute('SELECT * FROM medico WHERE email = ?', [email]);
  if (existingUser.length > 0) {
    return res.render('signup', { error: 'El email ya está registrado.' });
  }

  // Generar hash para la contraseña
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  // Crear nuevo usuario
  await db.execute(
    'INSERT INTO medico (email, especialidad, contraseña, nombre) VALUES (?, ?, ?, ?)',
    [email,especialidad, hashedPassword, nombre]
  );

  res.redirect('/login'); // Redirigir al login tras registrarse
};

exports.login = async (req, res) => {
  const { email, password } = req.body;
  console.log(email, password);
  const [rows] = await db.execute('SELECT * FROM medico WHERE email = ?', [email]);

  if (rows.length === 0) {
    return res.render('login', { message: 'Usuario o contraseña incorrectas' });
  }
  const medico = rows[0];

  // Comparar contraseña con hash
  const validPassword = await bcrypt.compare(password, medico.contraseña);
  console.log(validPassword);
  console.log(medico.contraseña);
  if (!validPassword) {
    return res.render('login', { message: 'Usuario o contraseña incorrectas' });
  }

  // Autenticar al usuario
  req.session.medicoId = medico.id_medico;
  res.redirect(`/agenda/${medico.id_medico}`);
};


// Middleware de autenticación
exports.isAuthenticated = (req, res, next) => {
  if (req.session.loggedIn && req.session.medicoId) {
    next();
  } else {
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
  
  // Verificar si el médico tiene una agenda
  const [agenda] = await db.execute('SELECT * FROM agenda WHERE id_medico = ?', [medicoId]);

  if (agenda.length === 0) {
    // Crear una nueva agenda para el médico
    await db.execute('INSERT INTO agenda (id_medico) VALUES (?)', [medicoId]);
    console.log(`Agenda creada automáticamente para el médico con ID ${medicoId}`);
  }

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

exports.addUserToLocals = async (req, res, next) => {
  if (req.session.loggedIn && req.session.medicoId) {
    try {
      const [rows] = await db.execute('SELECT nombre FROM medico WHERE id_medico = ?', [req.session.medicoId]);
      if (rows.length > 0) {
        res.locals.usuario = rows[0].nombre; 
      }
    } catch (error) {
      console.error('Error al obtener los datos del usuario:', error);
    }
  }
  next();
};

exports.logout = (req, res) => {
  req.session = null; 
  res.redirect('/login'); 
};


exports.cancelarTurno = async (req, res) => {
  const turnoId = req.body.turnoId; 
  const medicoId = req.session.medicoId; 

  if (!turnoId) {
    console.error('Error: turnoId no está definido.');
    return res.status(400).send('El ID del turno no se proporcionó.');
  }

  try {
    // Verificar si el turno pertenece al médico actual
    const turno = await turnosModel.obtenerTurnoPorId(turnoId);
    if (!turno || turno.id_medico !== medicoId) {
      return res.status(403).send('No tienes permiso para cancelar este turno.');
    }

    // Marcar turno como cancelado
    const result = await turnosModel.marcarTurnoCancelado(turnoId);
    if (result.affectedRows > 0) {
      return res.redirect(`/agenda/${medicoId}?success=Turno cancelado con éxito.`);
    }

    res.status(500).send('No se pudo cancelar el turno.');
  } catch (error) {
    console.error('Error al cancelar el turno:', error);
    res.status(500).send('Error interno del servidor.');
  }
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



