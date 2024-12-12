document.addEventListener('DOMContentLoaded', () => {
    const btnMedicoActual = document.getElementById('btnMedicoActual');
    const btnOtrosMedicos = document.getElementById('btnOtrosMedicos');
    const consultasMedicoActual = document.getElementById('consultasMedicoActual');
    const consultasOtrosMedicos = document.getElementById('consultasOtrosMedicos');
  
    // Mostrar consultas del médico actual
    btnMedicoActual.addEventListener('click', () => {
      consultasMedicoActual.style.display = 'block';
      consultasOtrosMedicos.style.display = 'none';
    });
  
    // Mostrar consultas de otros médicos
    btnOtrosMedicos.addEventListener('click', () => {
      consultasMedicoActual.style.display = 'none';
      consultasOtrosMedicos.style.display = 'block';
    });
  });
  