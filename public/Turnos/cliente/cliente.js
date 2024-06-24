const socket = io();

// Manejar el envío del formulario
document.getElementById('formularioTurno').addEventListener('submit', function(event) {
    event.preventDefault();

    const nombre = document.getElementById('nombre').value;
    const servicio = document.getElementById('servicio').value;

    socket.emit('solicitudTurno', { cliente: nombre, servicio: servicio });

    // Mostrar la alerta
    const alerta = document.getElementById('alerta');
    alerta.style.display = 'block';

    setTimeout(() => {
        alerta.style.display = 'none';
    }, 3000);

    // Limpiar el formulario
    this.reset();
});

document.addEventListener('DOMContentLoaded', function() {
    var btnContinuar = document.getElementById('btnContinuar');
    var ladoIzquierdo = document.querySelector('.lado-izquierdo');
    var ladoDerecho = document.querySelector('.lado-derecho');
    
    btnContinuar.addEventListener('click', function() {
        ladoIzquierdo.style.display = 'none';
        ladoDerecho.style.display = 'flex';

        // Añadir clase para mostrar con transición
        setTimeout(function() {
            ladoDerecho.classList.add('mostrar');
        }, 100); 
    });
});

window.addEventListener('keydown', function(event) {
    if (event.ctrlKey === true && (event.key === '+' || event.key === '-')) {
        event.preventDefault();
    }
});