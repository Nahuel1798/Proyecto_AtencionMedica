// routes/medico.js
const express = require('express');
const router = express.Router();
const medicoController = require('../controllers/medicoController');

router.get('/login', medicoController.loginPage);
router.post('/login', medicoController.login);

// Ruta protegida para la agenda del médico
router.get('/agenda/:medicoId', (req, res, next) => {
    if (!req.session.medicoId) {
      // Si no hay un médico logueado, redirigir al login
      return res.redirect('/login');
    }
    next();
  }, medicoController.agenda);

router.get('/nuevo-turno', medicoController.isAuthenticated, medicoController.nuevoTurnoPage);
router.post('/nuevo-turno', medicoController.isAuthenticated, medicoController.crearTurno);

module.exports = router;
