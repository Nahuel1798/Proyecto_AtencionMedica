const express = require('express');
const router = express.Router();
const templateController = require('../controllers/templateController');

// Ruta para mostrar el formulario de consulta
router.get('/template', templateController.nuevoTemplatePage);

// Ruta para guardar la consulta
router.post('/template', templateController.guardarTemplate);

module.exports = router;