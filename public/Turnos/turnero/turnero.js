const socket = io();

const turnoEsperaDiv = document.getElementById('turnoEspera');
const turnoAtendiendoDiv = document.getElementById('turnoAtendiendo');
const turnosAtendidosDiv = document.getElementById('turnosAtendidos');
const atenderTurnoBtn = document.getElementById('atenderTurno');
const terminarTurnoBtn = document.getElementById('terminarTurno');
const notificacionAudio = document.getElementById('notificacionAudio');
const contadoresPorDiaDiv = document.getElementById('contadoresPorDia');

// Función para mostrar mensajes cuando no hay turnos
function mostrarMensajeNoTurnos(elemento, mensaje) {
    if (elemento.children.length === 0) {
        elemento.innerHTML = `<p class="no-turnos">${mensaje}</p>`;
    }
}

// Función para actualizar mensaje después de atender un turno
function actualizarMensajeDespuesDeAtender() {
    if (turnoEsperaDiv.children.length === 0) {
        turnoEsperaDiv.innerHTML = `<p class="no-turnos">Se esperan más turnos...</p>`;
    }
    if (turnoAtendiendoDiv.children.length === 0) {
        turnoAtendiendoDiv.innerHTML = `<p class="no-turnos">No hay turnos en atencion</p>`;
    }
}

socket.on('nuevoTurno', (turno) => {
    console.log('Nuevo turno recibido:', turno);

    // Mostrar el nuevo turno dependiendo del estado
    if (turno.estado === 'espera') {
        // Crear el nuevo elemento de turno en espera
        const nuevoTurnoEspera = document.createElement('div');
        nuevoTurnoEspera.classList.add('turno');
        nuevoTurnoEspera.id = turno.numero;
        nuevoTurnoEspera.innerHTML = `
            <span class="numero">${turno.numero}</span>
            <i class="fa-solid fa-clock"></i>
        `;
    
        // Añadir el nuevo turno al inicio de turnoEsperaDiv
        turnoEsperaDiv.insertBefore(nuevoTurnoEspera, turnoEsperaDiv.firstChild);
    
        // Si hay un mensaje de no hay turnos en espera, eliminarlo
        const mensajeNoTurnos = turnoEsperaDiv.querySelector('.no-turnos');
        if (mensajeNoTurnos) {
            mensajeNoTurnos.remove();
        }
    } else if (turno.estado === 'atendiendo') {
        // Crear el nuevo elemento de turno en atención
        const nuevoTurnoAtendiendo = document.createElement('div');
        nuevoTurnoAtendiendo.classList.add('turno');
        nuevoTurnoAtendiendo.id = turno.numero;
        nuevoTurnoAtendiendo.innerHTML = `
            <span class="numero">${turno.numero}</span>
            <span class="puesto">${turno.puesto}</span>
        `;
    
        // Añadir el nuevo turno al inicio de turnoAtendiendoDiv
        turnoAtendiendoDiv.insertBefore(nuevoTurnoAtendiendo, turnoAtendiendoDiv.firstChild);
    
        // Si hay un mensaje de no hay turno actual, eliminarlo
        const mensajeNoTurnoActual = turnoAtendiendoDiv.querySelector('.no-turnos');
        if (mensajeNoTurnoActual) {
            mensajeNoTurnoActual.remove();
        }
    
        // Reproducir el sonido cuando se pasa a atención
        notificacionAudio.play();
        actualizarMensajeDespuesDeAtender();
    }
});

socket.on('turnoAnterior', (turnoAnterior) => {
    console.log('Turno anterior recibido:', turnoAnterior);

    // Mover el turno atendido a la lista de turnos atendidos
    turnosAtendidosDiv.innerHTML += `<div class="turno">
                                        <span class="numero">${turnoAnterior.numero}</span>
                                     </div>`;
    turnoAtendiendoDiv.innerHTML = '';
    actualizarMensajeDespuesDeAtender();
});

socket.on('turnosAtendidos', (turnos) => {
    console.log('Turnos atendidos recibidos:', turnos);

    // Mostrar todos los turnos atendidos
    turnosAtendidosDiv.innerHTML = '';
    if (turnos.length === 0) {
        turnosAtendidosDiv.innerHTML = `<p>No hay turnos atendidos</p>`;
    } else {
        turnos.forEach(turno => {
            turnosAtendidosDiv.innerHTML += `<div class="turno">
                                                <span class="numero">${turno.numero}</span>
                                                <span class="puesto">${turno.puesto}</span>
                                             </div>`;
        });
    }
});

socket.on('contadoresTurnosPorDia', (contadores) => {
    console.log('Contadores por día recibidos:', contadores);

    // Mostrar los contadores por día con formato de fecha dd/mm/yyyy
    contadoresPorDiaDiv.innerHTML = '';
    for (const fecha in contadores) {
        const [year, month, day] = fecha.split('-');
        const formattedDate = `${day}/${month}/${year}`;
        contadoresPorDiaDiv.innerHTML += `<div><span class="fecha">${formattedDate}</span><span class="total">${contadores[fecha]}</span></div>`;
    }
});

// Eliminar el turno en espera cuando se pasa a atención
socket.on('eliminarTurnoEnEspera', (numero) => {
    const turnoEnEspera = document.getElementById(numero);
    if (turnoEnEspera) {
        turnoEnEspera.remove();
        actualizarMensajeDespuesDeAtender();
    }
});

// Botón para pasar turno a atención
atenderTurnoBtn.addEventListener('click', () => {
    const turnoEnEspera = turnoEsperaDiv.querySelector('.turno');
    const turnoAtendiendo = turnoAtendiendoDiv.querySelector('.turno');

    if (!turnoAtendiendo && turnoEnEspera) {
        const numero = turnoEnEspera.id;
        socket.emit('pasarAAtencion', { numero: numero });
    } else {
        // Mostrar alerta centrada en la parte superior de la página
        const mensaje = 'Ya hay un turno en atención. Debes esperar a que sea atendido.';
        const alerta = document.createElement('div');
        alerta.classList.add('alert');
        alerta.innerHTML = `<p>${mensaje}</p>`;

        document.body.appendChild(alerta);
        
        setTimeout(() => {
            alerta.remove();
        }, 5000); 
    }
});

// Botón para marcar turno como atendido
terminarTurnoBtn.addEventListener('click', () => {
    const turnoAtendiendo = turnoAtendiendoDiv.querySelector('.turno');
    if (turnoAtendiendo) {
        const numero = turnoAtendiendo.querySelector('.numero').textContent; 
        socket.emit('marcarComoAtendido', { numero: numero });
    }
});

// Mostrar mensajes de no hay turnos al cargar la página
document.addEventListener('DOMContentLoaded', () => {
    mostrarMensajeNoTurnos(turnoEsperaDiv, 'No hay turnos en espera');
    mostrarMensajeNoTurnos(turnoAtendiendoDiv, 'No hay turno actual');
    mostrarMensajeNoTurnos(turnosAtendidosDiv, 'No hay turnos atendidos');
});
