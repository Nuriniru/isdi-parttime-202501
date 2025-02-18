
function guessNumber() {

    var randomNumber = Math.floor(Math.random() * 10);
    var attempts = 0;
    var guess;
    
    while (true) {
        guess = prompt("¿En qué número crees que estoy pensando?");
        
        if (guess === null) {
            alert("Has cancelado el juego.");
            break;
        }

        guess = Number(guess);

        if (isNaN(guess)) {
            alert("Por favor, ingresa un número válido.");
            continue;
        }
        
        attempts++; 
        
        if (guess === randomNumber) {
            alert(`¡Felicidades! Has adivinado el número en ${attempts} intentos.`);
            break;
        } else if (guess < randomNumber) {
            alert("No es el número correcto. El número es más alto.");
        } else {
            alert("No es el número correcto. El número es más bajo.");
        }
    }
}

var isGameOn = confirm("¿Quieres jugar a un juego?");

if (isGameOn) {
    guessNumber();
} else {

    alert("Pues vete");
}