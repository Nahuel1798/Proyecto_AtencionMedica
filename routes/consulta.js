// routes/consulta.js
var express = require('express');
var router = express.Router();

const consultaController = require('../controllers/consultaController');
const medicoController = require('../controllers/medicoController');

// Ruta para mostrar el formulario de consulta
router.get('/consulta/:turnoId/:pacienteId', consultaController.formularioConsulta);

// Ruta para guardar la consulta
router.post('/consulta/:turnoId/:pacienteId', consultaController.guardarConsulta);

//ruta para mostrar la agenda del medico
router.get('/agenda/:medicoId',medicoController.agenda);

module.exports = router;
