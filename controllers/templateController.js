const consultaModel = require('../models/templateModel');
exports.nuevoTemplatePage = (req, res) => {
    res.render('template', { medicoId: req.session.medicoId });
  };

// Guardar un nuevo template
  exports.guardarTemplate = async (req, res) => {
    const { nombretemplate, contenedor } = req.body;
    const medicoId = req.session.medicoId;
  
    try {
      await consultaModel.guardarTemplate(medicoId, nombretemplate, contenedor);
      res.redirect(`/agenda/${medicoId}`);
    } catch (error) {
      console.error('Error al guardar el template:', error);
      res.status(500).send('Error al guardar el template');
    }
  };
  