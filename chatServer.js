const express = require("express");
const app = express();

const http = require('http');
const server = http.createServer(app);

const { Server } = require('socket.io');
const io = new Server(server);

let messages = []; 
let connectedUsers = 0; 

app.use(express.static(__dirname + '/public/Chat'));

app.get("/", (req, res) => {
    res.sendFile(`${__dirname}/public/Chat/index.html`);
});

server.listen(3000, () => {
    console.log(`Servidor funcionando en http://localhost:3000`);
});

io.on("connection", (socket) => {
    console.log('Un cliente se ha conectado');
    connectedUsers++;
    
    // Enviar mensaje inicial al cliente que se conecta
    socket.emit('messages', messages);

    // Mostrar alerta cuando un usuario se conecte
    io.emit('new-message', { author: 'Servidor', text: '¡Bienvenido! Inicia una conversación. Solo Max. 2 Personas' });

    socket.on('new-message', (data) => {
        messages.push(data);
        io.emit('messages', messages);
    });

    socket.on('disconnect', () => {
        connectedUsers--;
        console.log('Un cliente se ha desconectado');
        
        if (connectedUsers === 0) {
            messages = []; // Limpiar los mensajes si no hay usuarios conectados
        }

        // Emitir mensaje de desconexión a todos los clientes
        io.emit('new-message', { author: 'Servidor', text: 'Un usuario se ha desconectado.' });
    });
});
