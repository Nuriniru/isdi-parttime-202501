var body = document.body;
var currentView;

/*Función para añadir multiples hijos a el elemento padre que es el primero que pasamos hecha por nosotros para ver más fors*/
function appendChildren() {
    var parent = arguments[0] //el primer elemento es el contendor
    for (var i = 1; i < arguments.length; i++) {
        parent.appendChild(arguments[i])   //añadimos el resto de elementos
    }
    return parent
}

/*Crear un elemento html que contiene texto*/
function createTextContainer(tag, text, style) {
    var element = document.createElement(tag);
    element.textContent = text;
    element.className = style;
    return element
}

/*Crear un botón y le pasa en el parametro "callback" que es la función que se ejecuta al hacer click*/
function createButton(text, style, callback) {
    var button = document.createElement('button');
    button.className = style;
    button.textContent = text;
    button.addEventListener('click', callback) //Se activa la función que hemos pasado como parametro al hacer click
    return button
}

/*Crear un contenedor (un div con estilos definidos)*/
function createContainer(style) {
    var container = document.createElement('div');
    container.className = style;
    return container
}

function createForm(inputsArray, submitButtonText, callback) { //inputsArray = [{label: 'Email', inputType: 'email', inputPlaceholder: 'my@email.com', inputId: 'email'}, {label: 'Password....}]
    var formContainer = document.createElement('form');
    formContainer.className = 'form'
    for (var i = 0; i < inputsArray.length; i++) {
        var input = inputsArray[i] //input[i] = {label: 'Email', inputType: 'email', inputPlaceholder: 'my@email.com', inputId: 'email'}
        var label = document.createElement('label')
        label.htmlFor = input.inputId //input = {... inputId: 'email'}; input.inputId === 'email'
        label.textContent = input.label
        var inputElement = document.createElement('input')
        inputElement.type = input.inputType;
        inputElement.id = input.inputId;
        inputElement.placeholder = input.inputPlaceholder
        inputElement.required = input.isRequired

        appendChildren(formContainer, label, inputElement)
    }

    var submitButton = document.createElement('input');
    submitButton.type = 'submit';
    submitButton.value = submitButtonText

    formContainer.appendChild(submitButton)

    formContainer.addEventListener('submit', function (event) {
        event.preventDefault()

        var form = event.target; // --> elemento form html al que le hemos dado submit
        var formData = {};

        //iterar todos los inputs que he generado en el formulario, de esos inputs quiero acceder al valor que ha escrito el usuario
        for (var i = 0; i < inputsArray.length; i++) {
            //inputsArray = [{ label: 'Email', inputType: 'email', inputPlaceholder: 'my@email.com', inputId: 'email' }, ...]
            // normalmente para acceder al valor de un input a traves del id --> event.target.idDelInput (e.g. event.target.email)

            //form[inputsArray[i].inputId] ---> event.target['email'] === event.target.email
            //console.log(form[inputsArray[i].inputId].value) //<input />.value
            var fieldName = inputsArray[i].inputId;
            var value = form[inputsArray[i].inputId].value

            formData[fieldName] = value; //formData = {'email': 'patata@mail.com'}
        }

        callback(formData)
    })

    return formContainer;

}

function registerUser(registerData) { //registerData = {'email': '', 'password': '', 'confirmation-password': ''}
    if (!registerData['email'] && !registerData['password'] && !registerData['confirmation-password']) { //!registerData['email'] => registerData['email'] === undefined && registerData['email'] === null
        alert('Register Data Incomplete')
        return;
    }
    if (registerData['password'] !== registerData['confirmation-password']) {
        alert('Password and confirmation password are not the same')
        return
    }
    /*Podriamos longitud, y caracteres de la contraseñar, validar que el mail no esta en uso, etc*/

    var usersJson = localStorage.getItem('users'); //comprobamos si en el localStorage hay una bbdd de juguete ya creada (se almacena como JSON)

    var users;
    if (!usersJson) { //si no la hay la creamos
        users = []
    } else {
        users = JSON.parse(usersJson) // pasar de json a javascript
    }

    //comprobar si el user ya existe

    var doesUserExist = users.some(function (_user) { return _user.email === registerData['email'] })
    if (doesUserExist) {
        alert('this mail is already in use')
        return
    }

    var username = registerData['email'].split('@')[0]

    var userCreated = { email: registerData['email'], password: registerData['password'], username, id: Date.now() }



    users.push(userCreated)

    localStorage.users = JSON.stringify(users) //actualizamos nuestra ddbb con el nuevo array de users - pasamos de js a json

    sessionStorage.id = userCreated.id //almacenamos en el sessionStorage el id del usuario que se acaba de registrar y loggear

    navigateToHome(currentView) //hemos creado una variable currentView para almacenar la pagina en la que estamos en ese momento y no tener que pasarla entre diversas funciones
}

function createRegisterPage() {
    var registerContainer = createContainer('');
    var registerTitle = createTextContainer('h1', 'Register', '');
    var objectEmail = { label: 'Email', inputType: 'email', inputPlaceholder: 'my@email.com', inputId: 'email', isRequired: true };
    var objectPassword = { label: 'Password', inputType: 'password', inputPlaceholder: '*******', inputId: 'password', isRequired: true }
    var objectConfirmPassword = { label: 'Confirm password', inputType: 'password', inputPlaceholder: '*******', inputId: 'confirmation-password', isRequired: true }
    var registerForm = createForm([objectEmail, objectPassword, objectConfirmPassword], 'Register', registerUser) //usamos una función que nos permite registrar el usuario y cambiar de vista


    var toLoginButton = createButton('Go to login', '', function () { navigateToLogin(view) })
    var view = appendChildren(registerContainer, registerTitle, registerForm, toLoginButton)

    return view

}

function createHomePage() {
    var homeContainer = createContainer('')
    var loggedUserId = JSON.parse(sessionStorage.getItem('id')); //comprobar si se ha guardado el id de un usuario loggeado
    var usersJson = localStorage.getItem('users') //me traigo el id y lo convierto a js
    var users = JSON.parse(usersJson) //convierto el json de usuarios js

    var userLogged = users ? users.find(function (_user) { return _user.id === loggedUserId }) : undefined
    //comprueba que el usuario loggeado esta en nuestra ddbb(si es que tenemos una base de datos)

    if (!userLogged) { //en caso de que no haya un id de usuario loggeado, en lugar de crear la vista de home, creamos la de register
        alert('inicia sesión o create una cuenta primero, listillo tocacódigos')
        return createRegisterPage();
    }

    var loggedUserUsername = userLogged.username //nos traemos el nombre de usuario para dar un mensaje de bienvenida personalizado
    var welcomeText = createTextContainer('h1', `Welcome, ${loggedUserUsername}`, '')

    var logoutButton = createButton('Logout', '', function () { sessionStorage.removeItem('id'); navigateToLogin(homeContainer) })


    appendChildren(homeContainer, welcomeText, logoutButton);
    return homeContainer
}

function loginUser(loginData) { //{'email': 'patata@mail.com'}
    //comprobamos si el email que ha puesto el usuario esta en la bbdd y si no lo esta, lanzamos un alert
    var usersJson = localStorage.getItem('users') //me traigo el id y lo convierto a js
    var users = JSON.parse(usersJson) //convierto el json de usuarios js

    var userLoginCheckout = users ? users.find(function (_user) { return _user['email'] === loginData['email'] }) : undefined

    //comprueba que el usuario loggeado esta en nuestra ddbb(si es que tenemos una base de datos)
    //si esta en la base de datos, comprobamos que la cotnraseña coincide con la del usuario, sino, lanzamos un alert
    if (!userLoginCheckout || userLoginCheckout['password'] !== loginData['password']) {
        alert("wrong credentials")
        return
    }

    sessionStorage.id = userLoginCheckout.id

    navigateToHome(currentView)

    //y si se cumple todo, guardamos el id en el session storage y navegamos a home

}

function createLoginPage() {
    var loginContainer = createContainer('')
    var loginTitle = createTextContainer('h1', 'Login', '');
    var objectEmail = { label: 'Email', inputType: 'email', inputPlaceholder: 'my@email.com', inputId: 'email', isRequired: true }
    var objectPassword = { label: 'Password', inputType: 'password', inputPlaceholder: '*******', inputId: 'password', isRequired: true }
    var loginForm = createForm([objectEmail, objectPassword], 'Login', loginUser)
    var toRegisterButton = createButton('Go to register', '', function () { navigateToRegister(loginContainer) })

    appendChildren(loginContainer, loginTitle, loginForm, toRegisterButton)
    return loginContainer
}

/*Crea la nueva vista del register y limpia la vista anterior*/
function navigateToRegister(previousView) {
    var registerView = createRegisterPage()
    currentView = registerView

    body.replaceChild(registerView, previousView)
}

/*Crea la vista de home y limpia la vista anterior */
function navigateToHome(previousView) {
    var homeView = createHomePage() //en caso de que no haya usuario loggeado, esta función devuelve createRegisterPage()
    currentView = homeView

    body.replaceChild(homeView, previousView)
}

/*Renderiza la vista del login y limpia la vista anterior*/
function navigateToLogin(previousView) {
    var loginContainer = createLoginPage();

    currentView = loginContainer

    body.replaceChild(loginContainer, previousView)
}


/*Renderizar landing*/
function renderLanding() {
    var landingContainer = createContainer('');
    var landingTitle = createTextContainer('h1', 'PET APP', 'title');
    var joinButton = createButton('JOIN IN!', '', function () { navigateToRegister(landingContainer) })

    currentView = landingContainer

    landingContainer.appendChild(landingTitle);
    landingContainer.appendChild(joinButton);
    body.appendChild(landingContainer);
}

function renderHomePage() {
    var homePage = createHomePage();
    body.appendChild(homePage)
}

sessionStorage.id ? renderHomePage() : renderLanding() //si hay un id de usuario logeado guardado, vamos a home, y si no a la landing
