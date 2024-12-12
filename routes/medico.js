// routes/medico.js
const express = require('express');
const router = express.Router();
const medicoController = require('../controllers/medicoController');

router.get('/login', medicoController.loginPage);
router.post('/login', medicoController.login);

router.get('/signup', medicoController.signupPage);
router.post('/signup', medicoController.signup);


// Ruta protegida para la agenda del médico
router.get('/agenda/:medicoId', (req, res, next) => {
    if (!req.session.medicoId) {
      // Si no hay un médico logueado, redirigir al login
      return res.redirect('/login');
    }
    next();
  }, medicoController.agenda);

router.get('/nuevo-turno',  medicoController.nuevoTurnoPage);
router.post('/nuevo-turno', medicoController.crearTurno);

router.get('/logout', medicoController.logout);

router.get('/cancelar-turno/:turnoId', medicoController.cancelarTurno);

module.exports = router;
