const navModels = require('../models/navModels');

exports.listarMedicos = async (req, res) => {
    const medicoId = req.session.medicoId;
    console.log(medicoId);
    const medicos = await navModels.getObtenerMedico();
    res.render('mostrarMedicos', { medicos, medicoId : medicoId[0], medicoId : req.session.medicoId }); 
};

exports.listarPacientes = async (req, res) => {
    const pacientes = await navModels.getObtenerPaciente();
    const pacienteFormateada = pacientes.map(item => {
        const fechapaciente = new Date(item.fecha_nacimiento);  // Cambiar "fecha_consulta" según el nombre del campo en tu base de datos
        const dia = String(fechapaciente.getDate()).padStart(2, '0');
        const mes = String(fechapaciente.getMonth() + 1).padStart(2, '0');
        const anio = fechapaciente.getFullYear();
        const fechaFormateada = `${dia}/${mes}/${anio}`;
    
        // Retornar el objeto original con la fecha formateada
        return { ...item, fecha_nacimiento: fechaFormateada };
      });
    res.render('mostrarPacientes', { pacientes: pacienteFormateada, medicoId : req.session.medicoId }); 
};