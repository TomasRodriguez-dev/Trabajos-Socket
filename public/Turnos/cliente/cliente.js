const socket = io();

// Manejar el envío del formulario
document.getElementById('formularioTurno').addEventListener('submit', function(event) {
    event.preventDefault();

    const nombre = document.getElementById('nombre').value;
    const servicio = document.getElementById('servicio').value;

    // Enviar los datos al servidor
    socket.emit('solicitudTurno', { cliente: nombre, servicio: servicio });

    alert('Solicitud de turno enviada. Espere su turno.');
    this.reset();
});