const navModels = require('../models/navModels');

exports.listarMedicos = async (req, res) => {
    const medicoId = req.session.medicoId;
    console.log(medicoId);
    const medicos = await navModels.getObtenerMedico();
    res.render('mostrarMedicos', { medicos, medicoId : medicoId[0], medicoId : req.session.medicoId }); 
};

exports.listarPacientes = async (req, res) => {

    const pacientes = await navModels.getObtenerPaciente();
    res.render('mostrarPacientes', { pacientes, medicoId : req.session.medicoId }); 
};