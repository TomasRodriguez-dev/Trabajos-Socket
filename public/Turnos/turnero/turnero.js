const socket = io();

// Elementos del DOM
const turnoEsperaDiv = document.getElementById('turnoEspera');
const turnoAtendiendoDiv = document.getElementById('turnoAtendiendo');
const turnosAtendidosDiv = document.getElementById('turnosAtendidos');
const atenderTurnoBtn = document.getElementById('atenderTurno');
const terminarTurnoBtn = document.getElementById('terminarTurno');
const notificacionAudio = document.getElementById('notificacionAudio');
const contadoresPorDiaDiv = document.getElementById('contadoresPorDia');

// Escuchar eventos del servidor
socket.on('nuevoTurno', (turno) => {
    console.log('Nuevo turno recibido:', turno);

    // Mostrar el nuevo turno dependiendo del estado
    if (turno.estado === 'espera') {
        turnoEsperaDiv.innerHTML += `<div class="turno" id="${turno.numero}">${turno.numero}</div>`;
    } else if (turno.estado === 'atendiendo') {
        // Mostrar todos los turnos en atención
        turnoAtendiendoDiv.innerHTML += `<div class="turno" id="${turno.numero}">
                                            <span class="numero">${turno.numero}</span>
                                            <span class="puesto">${turno.puesto}</span>
                                        </div>`;
        // Reproducir el sonido cuando se pasa a atención
        notificacionAudio.play();
    }
});

socket.on('turnoAnterior', (turnoAnterior) => {
    console.log('Turno anterior recibido:', turnoAnterior);

    // Mover el turno atendido a la lista de turnos atendidos
    turnosAtendidosDiv.innerHTML += `<div class="turno">${turnoAnterior.numero}</div>`;
    turnoAtendiendoDiv.innerHTML = '';
});

socket.on('turnosAtendidos', (turnos) => {
    console.log('Turnos atendidos recibidos:', turnos);

    // Mostrar todos los turnos atendidos
    turnosAtendidosDiv.innerHTML = '';
    turnos.forEach(turno => {
        turnosAtendidosDiv.innerHTML += `<div class="turno">${turno.numero} - ${turno.puesto}</div>`;
    });
});

socket.on('contadoresTurnosPorDia', (contadores) => {
    console.log('Contadores por día recibidos:', contadores);

    // Mostrar los contadores por día
    contadoresPorDiaDiv.innerHTML = '';
    for (const fecha in contadores) {
        contadoresPorDiaDiv.innerHTML += `<div>${fecha}: ${contadores[fecha]}</div>`;
    }
});

// Eliminar el turno en espera cuando se pasa a atención
socket.on('eliminarTurnoEnEspera', (numero) => {
    const turnoEnEspera = document.getElementById(numero);
    if (turnoEnEspera) {
        turnoEnEspera.remove();
    }
});

// Botón para pasar turno a atención
atenderTurnoBtn.addEventListener('click', () => {
    const turnoEnEspera = turnoEsperaDiv.querySelector('.turno');
    if (turnoEnEspera) {
        const numero = turnoEnEspera.id;
        socket.emit('pasarAAtencion', { numero: numero });
    }
});

// Botón para marcar turno como atendido
terminarTurnoBtn.addEventListener('click', () => {
    const turnoAtendiendo = turnoAtendiendoDiv.querySelector('.turno');
    if (turnoAtendiendo) {
        const numero = turnoAtendiendo.querySelector('.numero').textContent; // Obtener el número del turno
        socket.emit('marcarComoAtendido', { numero: numero });
    }
});