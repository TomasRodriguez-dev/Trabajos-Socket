let socket = io();
let firstUser = null;
let usernameInput = document.getElementById('username-container');

socket.on('messages', function(data) {
    render(data);
});

socket.on('new-message', function(data) {
    showAlert(data.text);
});

function render(data) {
    var html = data.map(function(elem, index) {
        // Determinar la clase del mensaje
        var messageClass = (elem.author === firstUser) ? 'sent-message' : 'received-message';
        return (
            `<div class="${messageClass}">
                <strong>${elem.author}</strong>:
                <em>${elem.text}</em>
            </div>`
        );
    }).join(" ");
    document.getElementById('messages').innerHTML = html;
}

function addMessage(e) {
    var username = document.getElementById('username').value;
    var text = document.getElementById('texto').value;

    // Validaciones
    if(username.trim() === "") {
        showAlert("Por favor, ingresa tu nombre.");
        return false;
    }

    if(text.trim() === "") {
        showAlert("Por favor, ingresa un mensaje.");
        return false;
    }

    // Si firstUser aún no tiene un valor, asignar el nombre actual
    if (!firstUser) {
        firstUser = username.trim();
        // Ocultar el campo de nombre después de la primera vez
        usernameInput.style.display = 'none';
    }

    var mensaje = {
        author: username,
        text: text
    };

    socket.emit('new-message', mensaje);

    // Mostrar alerta de mensaje enviado
    showSentAlert();

    document.getElementById('texto').value = ''; 
    return false;
}

function showSentAlert() {
    var sentAlert = document.createElement('div');
    sentAlert.classList.add('sent-alert');
    sentAlert.textContent = '¡Mensaje enviado!';

    document.body.appendChild(sentAlert);

    setTimeout(() => {
        sentAlert.style.display = 'none';
    }, 3000); 
}

function showAlert(message) {
    var alertElement = document.createElement('div');
    alertElement.classList.add('alert');
    
    alertElement.textContent = message;

    var closeBtn = document.createElement('span');
    closeBtn.classList.add('closebtn');
    closeBtn.innerHTML = '&times;'; 
    closeBtn.onclick = () => {
        alertElement.style.display = 'none';
    };
    alertElement.appendChild(closeBtn);

    document.body.appendChild(alertElement);

    setTimeout(() => {
        alertElement.style.display = 'none';
    }, 3000); 
}
