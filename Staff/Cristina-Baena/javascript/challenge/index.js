var choices = ['rock', 'paper', 'scissors'];
var body = document.body;
var computerChoice =  ""; //cpu
var playerChoice = "";  //jugador
var guessedChoiceArray = ""; //almacena el patron choice
var life = 2; //vidas
var round = 3; //rondas
var win = ""; //ganador -- si vidas = 2 ganas
var loose = ""; //perdedor si vidas = 0 pierdes


/*COMPUTER RANDOM CHOICE*/
function getComputerChoice() {
    return choices[Math.floor(Math.random() * choices.length)];
}



/*TITTLE*/

var gameTitle = document.createElement('h1');
gameTitle.textContent = 'Rock Paper or Scissors';
gameTitle.style.textAlign = 'center';
gameTitle.style.color = '#131e29'
body.appendChild(gameTitle);

/*DISPLAY*/
var resultDiv = document.createElement('div');
resultDiv.style.textAlign = 'center';
resultDiv.style.marginTop = '20px';
resultDiv.style.fontSize = '24px';
body.appendChild(resultDiv);

/*CONTAINER BUTTONS*/
var buttonContainer = document.createElement('div');
buttonContainer.style.display = 'flex';
buttonContainer.style.flexDirection = 'row';
buttonContainer.style.justifyContent = 'center';
buttonContainer.style.padding = '2em';
body.appendChild(buttonContainer);

/*BUTTON GENERATION*/
function generateChoiceButton(choice) {
    var button = document.createElement('button');
    button.textContent = choice;
    button.style.backgroundColor = '#FA7E61';
    button.style.color = 'white';
    button.style.border = 'none';
    button.style.padding = '1rem';
    button.style.margin = '5px';
    button.style.cursor = 'pointer';
    button.style.width = '20rem';

    button.addEventListener('click', function () {
        playerChoice = choice;
        computerChoice = getComputerChoice();
        playWinner();
    });

    buttonContainer.appendChild(button);
}

/*Generate button */
for (var i = 0; i < choices.length; i++) {
    generateChoiceButton(choices[i]);
}



/*WINNER*/

function playWinner() {
    var resultMessage = `Has elegido: <b>${playerChoice}</b><br>La máquina ha eligido: <b>${computerChoice}</b><br>`;

    if (playerChoice === computerChoice) {
        resultMessage += `¡Es un empate!`;
    } else if (
        (playerChoice === 'paper' && computerChoice === 'rock') ||
        (playerChoice === "rock" && computerChoice === "scissors") ||
        (playerChoice === "scissors" && computerChoice === "paper")
    ) {
        resultMessage += `¡Has ganado!`;
    } else {
        resultMessage += `¡Has perdido!`;
    }
    
    resultDiv.innerHTML = resultMessage;
}






/*
 * hay que crear un div que contenga 3 variables
 * * resultados cada vez que se clique el botón, veces que ganas y pierdes(si pierdes dos veces se acaba el juego), las rondas en la que estás jugando
 * ponerle filtro beauty
 * HACER DOS FUNCIONES CON RESULTADOS UNO PARA RONDAS OTRO PARA MOSTRAR RONDA Y TEXTO PERSONALIZADO
*/


// Crear una función que, pasada la elección hecha por el jugador ejecuta
// una decisión hecha al azar por el CPU
// luego de estas dos decisiones, se comparan y se elige quien gana
// cuando se sabe quien ha ganado, se le avisa de ello al usuario

//que se renderize feedback de lo que ha elegido el usuario y lo que ha
//elegido al azar por parte del cpu