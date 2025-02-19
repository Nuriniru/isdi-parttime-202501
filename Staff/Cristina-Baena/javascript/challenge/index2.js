var choices = ['rock', 'paper', 'scissors'];
var body = document.body;
var computerChoice = ""; //cpu
var playerChoice = ""; //jugador
var roundsPlayed = 0; //rounds 
var playerScore = 0; //player win
var computerScore = 0; //computer win

/*COMPUTER RANDOM CHOICE*/
function getComputerChoice() {
    return choices[Math.floor(Math.random() * choices.length)];
}

/*TITTLE*/
var gameTitle = document.createElement('h1');
gameTitle.textContent = 'Rock Paper or Scissors - Mejor de 3';
gameTitle.style.textAlign = 'center';
gameTitle.style.color = '#131e29';
body.appendChild(gameTitle);

/*SCORE DISPLAY*/
var scoreDiv = document.createElement('div');
scoreDiv.style.textAlign = 'center';
scoreDiv.style.marginTop = '10px';
scoreDiv.style.fontSize = '20px';
body.appendChild(scoreDiv);

/*ROUND DISPLAY*/
var roundDiv = document.createElement('div');
roundDiv.style.textAlign = 'center';
roundDiv.style.marginTop = '10px';
roundDiv.style.fontSize = '18px';
body.appendChild(roundDiv);

/*RESULT DISPLAY*/
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

    button.addEventListener('click', function() {
        if (roundsPlayed < 3) {
            playerChoice = choice;
            computerChoice = getComputerChoice();
            playRound();
        }
    });

    buttonContainer.appendChild(button);
}

/*Generate buttons*/
for (var i = 0; i < choices.length; i++) {
    generateChoiceButton(choices[i]);
}

/*PLAY ROUND*/
function playRound() {
    roundsPlayed++;
    var roundResult = "";
    var gameResult = "";

    // ¿Quién gana?
    if (playerChoice === computerChoice) {
        roundResult = "¡Es un empate!";
    } else if (
        (playerChoice === 'paper' && computerChoice === 'rock') ||
        (playerChoice === "rock" && computerChoice === "scissors") ||
        (playerChoice === "scissors" && computerChoice === "paper")
    ) {
        playerScore++;
        roundResult = "¡Has ganado esta ronda!";
    } else {
        computerScore++;
        roundResult = "¡Has perdido esta ronda!";
    }

    // Texto de resultado rondas y ganadores
    roundDiv.innerHTML = `Ronda ${roundsPlayed}/3`;
    scoreDiv.innerHTML = `Jugador: ${playerScore} | CPU: ${computerScore}`;
    
    var resultMessage = `Eliges: ${playerChoice}<br>
                        CPU: ${computerChoice}<br>
                        ${roundResult}`;

    // ¿hay ya 3 rondas?
    if (roundsPlayed === 3) {
        if (playerScore > computerScore) {
            resultMessage="";
            gameResult = "<br><br>¡FELICIDADES! Has ganado";
        } else if (computerScore > playerScore) {
            resultMessage="";
            gameResult = "<br><br>¡Game Over!La CPU ha ganado!";
        } else {
            resultMessage="";
            gameResult = "<br><br>¡El juego ha terminado en empate!";
        }

    }

    resultDiv.innerHTML = resultMessage + gameResult;
}