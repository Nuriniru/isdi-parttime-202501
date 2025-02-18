/*
* nada más abrir ya está activo el juego
Te muestra con guiones el número de letras
Si le das a cancelar sales
5 vidas
preguntará por una letra
validar que es una letra
que sea indif mayúsculas y minúsculas
si no es una letra = fallo
si es una latra que sí está en el siguiente turno vemos (---ll--)
si pierdes y no has acertado quedas igual
cuando aciertas sale un mensajito
*/

var word = 'charmander';
var guessedWord= '';// almacena lo que se adivine hasta ahora
var lifes = 5;
var alphabet = 'abcdefghijklmnopqrstuvwxyz'
var alphabetUpper = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'

/* ESTA FUNCIÓN ESTA MAAAAAAAAAL
for(var i=0; i < word.length; i++){ // esto lo genera para guiones y espacios por si a caso
    if(word[i] === ' '){
        guessedWord[guessedWord.length] = ' '
    } else {
        guessedWord += '-'
    }
}
*/
function validateLetter(letter){
    if(letter.length !== 1 || letter === ' ' ){
        alert ('make sure you put a single letter')
        return false
    }
    for(var i = 0; i < alphabet.length; i++){
        if(letter === alphabet[i] || letter === alphabetUpper){
            return alphabet[i]
        }
    }
    return;

}

function checkLetterIncluded (letter){
    var isLetterInWord = false;
    for (var i=0; i < word.length; i++){
        if(letter === word[i]){
            guessedWord[i] = letter
        }
    }
    if(isLetterInWord === false){
        lifes --
    }
}





alert('Welcome to the Hangman Game, try to guess the word')

while(guessedWord !== word && lifes !== 0){
    var letterGuessed = prompt(`This is all you know about the word so far: /n    ${guessedWord} /n You have ${lifes}`)
    if(letterGuessed === null){
        guessedWord = word;
        alert('ok, bye')
    }else{
        var validateLetter= validateInputLetter(letterGuessed)
        if(validateLetter !== undefined){
        checkLetterIncluded(validateLetter)
    }

    }
  if(lifes== 0){
    alert('Oooh you lose')
  }
}