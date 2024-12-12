const db = require('./db');

module.exports = {
    getObtenerMedico: async () => {
        const [result] = await db.execute(`
            SELECT 
                id_medico,
                nombre,
                especialidad,
                email
            FROM medico
            WHERE id_medico
        `);

        return result;
    },

    getObtenerPaciente: async () => {
        const [result] = await db.execute(`
            SELECT 
                id_paciente,
                nombre,
                apellido,
                fecha_nacimiento,
                Dni,
                direccion,
                telefono
            FROM paciente
            WHERE id_paciente
        `);

        return result;
    },
};