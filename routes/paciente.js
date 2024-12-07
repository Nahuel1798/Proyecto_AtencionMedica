// routes/paciente.js
const express = require('express');
const router = express.Router();
const pacienteController = require('../controllers/pacienteController');

router.get('/historial/:pacienteId', pacienteController.historialClinico);

// Ruta para mostrar el formulario de modificación de la última consulta
router.get('/modificarConsulta/:consultaId', pacienteController.modificarConsulta);

// Ruta para manejar la actualización de la consulta
router.post('/actualizarConsulta/:consultaId', pacienteController.actualizarConsulta);

module.exports = router;
