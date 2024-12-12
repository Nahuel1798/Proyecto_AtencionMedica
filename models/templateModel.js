const db = require('./db');
// Guardar un nuevo template
exports.guardarTemplate = async (medicoId, nombre, contenido) => {
    const [result] = await db.execute(
        `INSERT INTO template_evolucion 
        (id_medico, nombre, texto_templete)
        VALUES (?, ?, ?)`,[medicoId, nombre, contenido]);
    return result;
  };
  
  // Obtener templates por médico
exports.obtenerTemplatesPorMedico = async (medicoId) => {
    const [result] = await db.execute(`SELECT * FROM template_evolucion WHERE id_medico = ?`, [medicoId]);
    return result;
  };
  