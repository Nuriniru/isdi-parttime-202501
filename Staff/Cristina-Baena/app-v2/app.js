var body = document.body;
var currentView;

/*Función para añadir múltiples hijos al elemento padre*/
function appendChildren() {
    var parent = arguments[0];
    for (var i = 1; i < arguments.length; i++) {
        parent.appendChild(arguments[i]);
    }
    return parent;
}

/*Crear un elemento html que contiene texto*/
function createTextContainer(tag, text, style) {
    var element = document.createElement(tag);
    element.textContent = text;
    element.className = style;
    return element;
}

/*Crear un botón con un callback al hacer click*/
function createButton(text, style, callback) {
    var button = document.createElement('button');
    button.className = style;
    button.textContent = text;
    button.addEventListener('click', callback);
    return button;
}

/*Crear un contenedor (div con estilos)*/
function createContainer(style) {
    var container = document.createElement('div');
    container.className = style;
    return container;
}

/*Crear un formulario dinámico*/
function createForm(inputsArray, submitButtonText, callback) {
    var formContainer = document.createElement('form');
    formContainer.className = 'form';
    
    for (var i = 0; i < inputsArray.length; i++) {
        var input = inputsArray[i];
        var label = document.createElement('label');
        label.htmlFor = input.inputId;
        label.textContent = input.label;
        
        var inputElement = document.createElement('input');
        inputElement.type = input.inputType;
        inputElement.id = input.inputId;
        inputElement.placeholder = input.inputPlaceholder;
        inputElement.required = input.isRequired;

        appendChildren(formContainer, label, inputElement);
    }

    var submitButton = document.createElement('input');
    submitButton.type = 'submit';
    submitButton.value = submitButtonText;

    formContainer.appendChild(submitButton);

    formContainer.addEventListener('submit', function (event) {
        event.preventDefault();

        var form = event.target;
        var formData = {};

        for (var i = 0; i < inputsArray.length; i++) {
            var fieldName = inputsArray[i].inputId;
            var value;
            if(inputsArray[i].inputType === 'checkbox'){
                value = form[inputsArray[i].inputId].checked
            } else {
                value = form[inputsArray[i],inputid].value
            }

            formData[fieldName] = value;
        }

        callback(formData);
    });

    return formContainer;
}

/*Registrar un nuevo usuario*/
function registerUser(registerData) {
    // Validaciones básicas
    if (!registerData['email'] || !registerData['password'] || !registerData['confirmation-password']) {
        alert('Datos de registro incompletos');
        return;
    }
    
    if (registerData['password'] !== registerData['confirmation-password']) {
        alert('Las contraseñas no coinciden');
        return;
    }

    // Obtener usuarios existentes
    var usersJson = sessionStorage.getItem('users');
    var users = usersJson ? JSON.parse(usersJson) : [];

    // Verificar si el usuario ya existe
    var doesUserExist = users.some(function (_user) { 
        return _user.email === registerData['email'] 
    });
    
    if (doesUserExist) {
        alert('Este correo ya está en uso');
        return;
    }

    // Crear nuevo usuario
    var username = registerData['email'].split('@')[0];
    var userCreated = { 
        email: registerData['email'], 
        password: registerData['password'], 
        username: username, 
        id: Date.now() 
    };

    users.push(userCreated);
    sessionStorage.users = JSON.stringify(users);
    sessionStorage.id = userCreated.id;

    navigateToHome(currentView);
}

/*Crear página de registro*/
function createRegisterPage() {
    var registerContainer = createContainer('');
    var registerTitle = createTextContainer('h1', 'Registro', '');
    
    var objectEmail = { 
        label: 'Correo Electrónico', 
        inputType: 'email', 
        inputPlaceholder: 'mi@correo.com', 
        inputId: 'email', 
        isRequired: true 
    };
    var objectPassword = { 
        label: 'Contraseña', 
        inputType: 'password', 
        inputPlaceholder: '*******', 
        inputId: 'password', 
        isRequired: true 
    };
    var objectConfirmPassword = { 
        label: 'Confirmar Contraseña', 
        inputType: 'password', 
        inputPlaceholder: '*******', 
        inputId: 'confirmation-password', 
        isRequired: true 
    };
    
    var registerForm = createForm(
        [objectEmail, objectPassword, objectConfirmPassword], 
        'Registrarse', 
        registerUser
    );

    var toLoginButton = createButton('Ir a Iniciar Sesión', '', function () { 
        navigateToLogin(view) 
    });
    
    var view = appendChildren(registerContainer, registerTitle, registerForm, toLoginButton);

    return view;
}

/*Crear página de inicio*/
function createHomePage() {
    var homeContainer = createContainer('');
    var loggedUserId;
    var users = JSON.parse(usersJson);
    if (localStorage.id){
        loggedUserId = JSON.parse(localStorage.getItem('id'));
    } else {
        loggedUserId = JSON.parse(sessionStorage.getItem('id'));
    }
    var userLogged = users ? users.find(function (_user) { 
        return _user.id === loggedUserId 
    }) : undefined;

    if (!userLogged) {
        alert('Inicia sesión o crea una cuenta primero');
        return createRegisterPage();
    }

    var loggedUserUsername = userLogged.username;
    var welcomeText = createTextContainer('h1', `Bienvenido, ${loggedUserUsername}`, '');

    var logoutButton = createButton('Cerrar Sesión', '', function () { 
        localStorage.removeItem('id');
        sessionStorage.removeItem('id');
        navigateToLogin(homeContainer) 
    });

    appendChildren(homeContainer, welcomeText, logoutButton);
    return homeContainer;
}

/*Iniciar sesión*/
function loginUser(loginData) {
    var usersJson = sessionStorage.getItem('users');
    var users = JSON.parse(usersJson);

    var userLoginCheckout = users ? users.find(function (_user) { 
        return _user['email'] === loginData['email'] 
    }) : undefined;

    if (!userLoginCheckout || userLoginCheckout['password'] !== loginData['password']) {
        alert("Credenciales incorrectas");
        return;
    }
    if (loginData['remember-me']) {
        localStorage.setItem('rememberedUser', userLoginCheckout.id);
    }
    
    sessionStorage.id = userLoginCheckout.id;
    navigateToHome(currentView);
}

/*Crear página de inicio de sesión*/
function createLoginPage() {
    var loginContainer = createContainer('');
    var loginTitle = createTextContainer('h1', 'Iniciar Sesión', '');
    
    var objectEmail = { 
        label: 'Correo Electrónico', 
        inputType: 'email', 
        inputPlaceholder: 'mi@correo.com', 
        inputId: 'email', 
        isRequired: true 
    };
    var objectPassword = { 
        label: 'Contraseña', 
        inputType: 'password', 
        inputPlaceholder: '*******', 
        inputId: 'password', 
        isRequired: true 
    };
    
    var loginForm = createForm(
        [objectEmail, objectPassword], 
        'Iniciar Sesión', 
        loginUser
    );
    
    var loginForm = createForm(
        [
            objectEmail, 
            objectPassword,
            {
                label: 'Recordarme', 
                inputType: 'checkbox', 
                inputId: 'remember-me', 
                isRequired: false
            }
        ], 
        'Iniciar Sesión', 
        loginUser
    );

    var toRegisterButton = createButton('Ir a Registro', '', function () { 
        navigateToRegister(loginContainer) 
    });

    appendChildren(loginContainer, loginTitle, loginForm, toRegisterButton);
    return loginContainer;
}

/*Navegar a página de registro*/
function navigateToRegister(previousView) {
    var registerView = createRegisterPage();
    currentView = registerView;
    body.replaceChild(registerView, previousView);
}

/*Navegar a página de inicio*/
function navigateToHome(previousView) {
    var homeView = createHomePage();
    currentView = homeView;
    body.replaceChild(homeView, previousView);
}

/*Navegar a página de inicio de sesión*/
function navigateToLogin(previousView) {
    var loginContainer = createLoginPage();
    currentView = loginContainer;
    body.replaceChild(loginContainer, previousView);
}

/*Renderizar página de bienvenida*/
function renderLanding() {
    var landingContainer = createContainer('');
    var landingTitle = createTextContainer('h1', 'Mi Bella App', 'title');
    var joinButton = createButton('¡ÚNETE!', '', function () { 
        navigateToRegister(landingContainer) 
    });

    currentView = landingContainer;

    appendChildren(landingContainer, landingTitle, joinButton);
    body.appendChild(landingContainer);
}

/*Renderizar página de inicio*/
function renderHomePage() {
    var homePage = createHomePage();
    body.appendChild(homePage);
}

// Punto de entrada de la aplicación
localStorage.id || sessionStorage.id ? renderHomePage() : renderLanding();