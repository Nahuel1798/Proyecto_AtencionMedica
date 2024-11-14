// routes/paciente.js
const express = require('express');
const router = express.Router();
const pacienteController = require('../controllers/pacienteController');

router.get('/historial/:pacienteId', pacienteController.historialClinico);

module.exports = router;
