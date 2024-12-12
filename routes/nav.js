const express = require('express');
const router = express.Router();
const navController = require('../controllers/navController');

router.get('/mostrarMedicos', navController.listarMedicos);

router.get('/mostrarPacientes', navController.listarPacientes);

module.exports = router;