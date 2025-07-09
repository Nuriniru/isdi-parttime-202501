// Obtener elementos del formulario
const loginTab = document.getElementById('login-tab');
const registerTab = document.getElementById('register-tab');
const loginForm = document.getElementById('login-form');
const registerForm = document.getElementById('register-form');
const message = document.getElementById('message');

// Obtener usuarios almacenados o crear un array vacío
let users = JSON.parse(localStorage.getItem('users')) || [];

// Evento para cambiar a pestaña de inicio de sesión
loginTab.addEventListener('click', function() {
    // Mostrar formulario de inicio de sesión
    loginTab.classList.add('active');
    registerTab.classList.remove('active');
    loginForm.classList.add('active');
    registerForm.classList.remove('active');
    message.style.display = 'none';
});

// Evento para cambiar a pestaña de registro
registerTab.addEventListener('click', function() {
    // Mostrar formulario de registro
    registerTab.classList.add('active');
    loginTab.classList.remove('active');
    registerForm.classList.add('active');
    loginForm.classList.remove('active');
    message.style.display = 'none';
});

// Evento de envío del formulario de inicio de sesión
loginForm.addEventListener('submit', function(event) {
    // Prevenir envío del formulario
    event.preventDefault();
    
    // Obtener valores de los campos
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    
    // Buscar usuario con credenciales coincidentes
    let foundUser = null;
    for (let i = 0; i < users.length; i++) {
        if (users[i].email === email && users[i].password === password) {
            foundUser = users[i];
            break;
        }
    }
    
    // Verificar si se encontró el usuario
    if (foundUser) {
        showMessage('¡Inicio de sesión exitoso! Bienvenido de nuevo, ' + foundUser.name, 'success');
        // En una aplicación real, se redirige al panel de control
    } else {
        // Mostrar error si no se encuentra el usuario
        showMessage('Correo electrónico o contraseña inválidos', 'error');
    }
});

// Evento de envío del formulario de registro
registerForm.addEventListener('submit', function(event) {
    // Prevenir envío del formulario
    event.preventDefault();
    
    // Obtener valores de los campos
    const name = document.getElementById('register-name').value;
    const email = document.getElementById('register-email').value;
    const password = document.getElementById('register-password').value;
    const confirmPassword = document.getElementById('register-confirm-password').value;
    
    // Verificar que las contraseñas coincidan
    if (password !== confirmPassword) {
        showMessage('Las contraseñas no coinciden', 'error');
        return;
    }
    
    // Verificar si el correo electrónico ya existe
    let emailExists = false;
    for (let i = 0; i < users.length; i++) {
        if (users[i].email === email) {
            emailExists = true;
            break;
        }
    }
    
    if (emailExists) {
        showMessage('El correo electrónico ya está registrado', 'error');
        return;
    }
    
    // Crear nuevo objeto de usuario
    const newUser = {
        name: name,
        email: email,
        password: password,
        fechaRegistro: new Date().toLocaleDateString()
    };
    
    // Agregar nuevo usuario al array
    users.push(newUser);
    
    // Guardar usuarios en localStorage
    localStorage.setItem('users', JSON.stringify(users));
    
    // Mostrar mensaje de éxito
    showMessage('Registro exitoso. Ahora puedes iniciar sesión.', 'success');
    
    // Limpiar campos del formulario
    registerForm.reset();
});

// Función para mostrar mensajes al usuario
function showMessage(text, type) {
    message.textContent = text;
    message.className = 'message ' + type;
    message.style.display = 'block';
}