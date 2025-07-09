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

        // Special handling for checkbox inputs
        if (input.inputType === 'checkbox') {
            // Create a container for the checkbox and label
            var checkboxContainer = document.createElement('div');
            checkboxContainer.className = 'checkbox-container';
            
            // Append the input first, then the label text
            checkboxContainer.appendChild(inputElement);
            
            // Create a span for the label text instead of using the label element's content
            var labelText = document.createElement('span');
            labelText.textContent = input.label;
            labelText.className = 'checkbox-label';
            
            // Append the label text after the checkbox
            checkboxContainer.appendChild(labelText);
            
            // Add the container to the form
            formContainer.appendChild(checkboxContainer);
        } else {
            // For non-checkbox inputs, keep the original behavior
            appendChildren(formContainer, label, inputElement);
        }
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
                value = form[inputsArray[i].inputId].value
            }

            formData[fieldName] = value;
        }

        callback(formData);
    });

    return formContainer;
}

function createLogo() {
    var logoContainer = createContainer('logo-container');
    var logo = document.createElement('img');
    logo.src = './logo.png'; 
    logo.className = 'logo';
    logoContainer.appendChild(logo);
    return logoContainer;
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
    var logo = createLogo();
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
    
    var view = appendChildren(registerContainer, logo, registerTitle, registerForm, toLoginButton);

    return view;
}


function createHomePage() {
    // Crear contenedor principal
    var homeContainer = createContainer('home-container');
    
    // Obtener el ID del usuario logueado
    var loggedUserId;
    if (localStorage.id) {
        loggedUserId = JSON.parse(localStorage.getItem('id'));
    } else {
        loggedUserId = JSON.parse(sessionStorage.getItem('id'));
    }
    
    // Obtener usuarios desde sessionStorage
    var usersJson = sessionStorage.getItem('users');
    var users = usersJson ? JSON.parse(usersJson) : [];
    
    var userLogged = users ? users.find(function (_user) { 
        return _user.id === loggedUserId 
    }) : undefined;

    if (!userLogged) {
        alert('Inicia sesión o crea una cuenta primero');
        return createRegisterPage();
    }

    // Crear encabezado
    var header = createContainer('app-header');
    
    // Crear logo pequeño para el encabezado
    var smallLogo = document.createElement('img');
    smallLogo.src = './logo.png';
    smallLogo.className = 'header-logo';
    
    // Crear botón de perfil de usuario
    var userButton = document.createElement('div');
    userButton.className = 'user-button';
    
    // Crear avatar del usuario
    var userAvatar = document.createElement('div');
    userAvatar.className = 'user-avatar';
    userAvatar.textContent = userLogged.username.charAt(0).toUpperCase();
    
    // Crear menú desplegable (oculto por defecto)
    var dropdownMenu = createContainer('dropdown-menu');
    
    // Crear botón de cierre de sesión
    var logoutButton = createButton('Cerrar Sesión', 'logout-button', function() {
        localStorage.removeItem('id');
        sessionStorage.removeItem('id');
        navigateToLogin(homeContainer);
    });
    
    // Agregar botón de cierre de sesión al menú desplegable
    dropdownMenu.appendChild(logoutButton);
    
    // Alternar visibilidad del menú desplegable cuando se hace clic en el botón de usuario
    userButton.addEventListener('click', function(event) {
        event.stopPropagation(); // Evitar que el evento se propague al documento
        dropdownMenu.classList.toggle('active');
    });
    
    // Cerrar menú desplegable al hacer clic fuera
    document.addEventListener('click', function() {
        dropdownMenu.classList.remove('active');
    });
    
    // Agregar elementos a sus contenedores
    userButton.appendChild(userAvatar);
    userButton.appendChild(dropdownMenu);
    
    header.appendChild(smallLogo);
    header.appendChild(userButton);
    
    // Crear un contenedor de cuerpo para contenido
    var bodyContainer = createContainer('content-container');
    
    // Crear sección para el foro
    var forumSection = createContainer('forum-section');
    var forumTitle = createTextContainer('h2', 'Bello foro de habladurías', 'section-title');
    
    // Crear formulario para nuevos posts
    var createPostContainer = createContainer('create-post-container');
    var createPostTitle = createTextContainer('h3', 'Nuevo cuqui post', 'subsection-title');
    
    // Objetos para los campos del formulario
    var objectPostTitle = {
        label: 'Título del Post',
        inputType: 'text',
        inputPlaceholder: 'Escribe un título para tu post',
        inputId: 'post-title',
        isRequired: true
    };
    
    var objectPostContent = {
        label: 'Contenido',
        inputType: 'text', // Usando text por ahora (podría modificarse para usar textarea)
        inputPlaceholder: 'Escribe el contenido de tu post',
        inputId: 'post-content',
        isRequired: true
    };
    
    var objectPostCategory = {
        label: 'Categoría',
        inputType: 'text',
        inputPlaceholder: 'Ej: Preguntas, Discusión, Ayuda',
        inputId: 'post-category',
        isRequired: true
    };
    
    // Función para crear un post en el foro
    function createForumPost(postData) {
        // Validaciones básicas
        if (!postData['post-title'] || !postData['post-content']) {
            alert('Por favor completa todos los campos del post');
            return;
        }
        
        // Obtener posts existentes o crear array vacío
        var postsJson = sessionStorage.getItem('posts');
        var posts = postsJson ? JSON.parse(postsJson) : [];
        
        // Crear nuevo post
        var newPost = {
            id: Date.now(),
            title: postData['post-title'],
            content: postData['post-content'],
            category: postData['post-category'] || 'General',
            authorId: userLogged.id,
            authorName: userLogged.username,
            timestamp: new Date().toISOString(),
            comments: []
        };
        
        // Agregar post a la lista y guardar en sessionStorage
        posts.push(newPost);
        sessionStorage.setItem('posts', JSON.stringify(posts));
        
        // Recargar la página para mostrar el nuevo post
        navigateToHome(homeContainer);
    }
    
    // Crear el formulario de post
    var postForm = createForm(
        [objectPostTitle, objectPostContent, objectPostCategory],
        'Publicar',
        createForumPost
    );
    
    // Agregar elementos al contenedor de creación de posts
    appendChildren(createPostContainer, createPostTitle, postForm);
    
    // Agregar contenedor para mostrar posts existentes
    var postsListContainer = createContainer('posts-list-container');
    var postsListTitle = createTextContainer('h3', 'Posts Recientes', 'subsection-title');
    var postsList = createContainer('posts-list');
    
    // Obtener y mostrar posts existentes
    var postsJson = sessionStorage.getItem('posts');
    var posts = postsJson ? JSON.parse(postsJson) : [];
    
    if (posts.length > 0) {
        posts.sort(function(a, b) {
            return new Date(b.timestamp) - new Date(a.timestamp);
        });
        
        // Mostrar cada post
        posts.forEach(function(post) {
            // Formatear la fecha para mostrarla de forma legible
            var postDate = new Date(post.timestamp);
            var formattedDate = postDate.toLocaleDateString() + ' ' + postDate.toLocaleTimeString();
            
            var postElement = createContainer('post-item');
            var postHeader = createContainer('post-header');
            var postTitle = createTextContainer('h4', post.title, 'post-title');
            var postAuthor = createTextContainer('p', 'Autor: ' + post.authorName, 'post-author');
            var postDate = createTextContainer('p', 'Fecha: ' + formattedDate, 'post-date');
            var postCategory = createTextContainer('p', 'Categoría: ' + post.category, 'post-category');
            var postContent = createTextContainer('p', post.content, 'post-content');
            var postFooter = createContainer('post-footer');
            
            // Ensamblar elementos del post
            appendChildren(postHeader, postTitle, postAuthor, postDate, postCategory);
            appendChildren(postElement, postHeader, postContent, postFooter);
            postsList.appendChild(postElement);
        });
    } else {
        // Mensaje cuando no hay posts
        var noPostsMessage = createTextContainer('p', 'No hay posts aún. ¡Sé el primero en publicar!', 'no-posts-message');
        postsList.appendChild(noPostsMessage);
    }
    
    // Agregar elementos al contenedor de lista de posts
    appendChildren(postsListContainer, postsListTitle, postsList);
    
    // Agregar todos los elementos de la sección de foro
    appendChildren(forumSection, forumTitle, createPostContainer, postsListContainer);
    
    // Agregar la sección de foro al contenedor principal
    bodyContainer.appendChild(forumSection);
    
    // Agregar todo al contenedor principal
    homeContainer.appendChild(header);
    homeContainer.appendChild(bodyContainer);
    
    currentView = homeContainer;
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
    var logo = createLogo();
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
        navigateToRegister(loginContainer);
    });

    appendChildren(loginContainer, logo, loginTitle, loginForm, toRegisterButton);
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
    var logo = createLogo();
    var landingTitle = createTextContainer('h1', 'Mi Bella App', 'title');
    var joinButton = createButton('¡ÚNETE!', '', function () { 
        navigateToRegister(landingContainer) 
    });

    currentView = landingContainer;

    appendChildren(landingContainer, logo,  landingTitle, joinButton);
    body.appendChild(landingContainer);
}

/*Renderizar página de inicio*/
function renderHomePage() {
    var homePage = createHomePage();
    body.appendChild(homePage);
}

// Punto de entrada de la aplicación
localStorage.id || sessionStorage.id ? renderHomePage() : renderLanding();