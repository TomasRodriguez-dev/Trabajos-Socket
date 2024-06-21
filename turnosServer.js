const express = require("express");
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require('socket.io');
const io = new Server(server);
const path = require('path');

app.use(express.static(path.join(__dirname, 'public')));

// Ruta para el cliente que solicita turno
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, '/public/Turnos/cliente/cliente.html'));
});

// Ruta para el turnero que muestra los turnos
app.get("/turnos", (req, res) => {
    res.sendFile(path.join(__dirname, '/public/Turnos/turnero/turnero.html'));
});

server.listen(4000, () => {
    console.log(`Servidor funcionando en http://localhost:4000`);
});

// Contador de turnos para cada tipo de servicio
let contadoresTurnos = {
    A: 0, 
    B: 0,
    C: 0,
    D: 0,
    E: 0
};

const puestosDisponibles = ['Puesto 01', 'Puesto 02', 'Puesto 03'];
let indicePuesto = 0;

let turnoActual = null;
let turnosEspera = [];
let turnosAtendidos = [];
let contadoresTurnosPorDia = {};

// Conexión de Socket.io
io.on('connection', (socket) => {
    console.log('Un cliente se ha conectado');

    // Manejar la solicitud de turno
    socket.on('solicitudTurno', (datos) => {
        console.log('Solicitud de turno recibida:', datos);

        // Generar número de turno basado en el tipo de servicio
        contadoresTurnos[datos.servicio]++;
        const numeroTurno = `${datos.servicio}${contadoresTurnos[datos.servicio].toString().padStart(2, '0')}`;
        const nuevoTurno = { numero: numeroTurno, cliente: datos.cliente, servicio: datos.servicio, estado: 'espera' };

        // Agregar el turno a la cola de espera
        turnosEspera.push(nuevoTurno);

        // Emitir evento con el nuevo turno asignado
        io.emit('nuevoTurno', nuevoTurno);
    });

    // Pasar turno a atención
    socket.on('pasarAAtencion', () => {
        console.log('Pasar turno a atención');
    
        // Verificar si hay turnos en espera
        if (turnosEspera.length > 0) {
            const primerTurno = turnosEspera.shift();
            
            // Asignar el puesto secuencialmente
            const puestoAsignado = puestosDisponibles[indicePuesto];
            indicePuesto = (indicePuesto + 1) % puestosDisponibles.length; // Incrementar y circular
            
            turnoActual = { ...primerTurno, estado: 'atendiendo', puesto: puestoAsignado };
    
            // Emitir eventos para actualizar el turno actual y la lista de espera
            io.emit('nuevoTurno', turnoActual);
            io.emit('eliminarTurnoEnEspera', primerTurno.numero);
        }
    });

    // Marcar turno como atendido
    socket.on('marcarComoAtendido', (datos) => {
        console.log('Marcar turno como atendido:', datos);
    
        // Actualizar el estado del turno actual y moverlo a la lista de atendidos
        if (turnoActual && turnoActual.numero === datos.numero) {
            turnoActual.estado = 'atendido';
            turnosAtendidos.push(turnoActual);
    
            // Obtener la fecha actual en formato YYYY-MM-DD
            const fechaActual = new Date().toISOString().slice(0, 10);
    
            // Verificar si existe el contador para esa fecha, si no, inicializarlo
            if (!contadoresTurnosPorDia[fechaActual]) {
                contadoresTurnosPorDia[fechaActual] = 0;
            }
            contadoresTurnosPorDia[fechaActual]++;
    
            io.emit('turnoAnterior', turnoActual);
            io.emit('turnosAtendidos', turnosAtendidos);
            io.emit('contadoresTurnosPorDia', contadoresTurnosPorDia); // Emitir contadores actualizados
            turnoActual = null;
        }
    });
    

    socket.on('disconnect', () => {
        console.log('Cliente desconectado');
    });
});