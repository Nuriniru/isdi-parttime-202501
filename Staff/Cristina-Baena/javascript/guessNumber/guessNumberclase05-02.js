var goalNumber = Math.floor(Math.random() * 10) + 1;
var isGameOn = confirm('play?');


if (isGameOn) {
    var counter = 1;
    var errors = 0;
    var roundsWon = 0;
    var rounds = [/*{ wasRoundWon: true/false, tries: counter}*/]

    while (roundsWon < 3 && isGameOn) {
        var isRoundOn = true;
        var guessInput = prompt('try your first guess number');
        var guessNumber = Number(guessInput);

        if (guessNumber !== goalNumber) {
            errors++
        }

        if (guessInput === null) {
            alert('ok bye');
            isGameOn = false;
        } else if (guessInput.trim() === '' || isNaN(guessNumber)) {
            alert('A NUMBER!');
            counter++
        } else if (guessNumber > goalNumber) {
            alert('try less')
            if (guessNumber - 3 <= goalNumber) {
                alert('just a bit')
            } else {
                alert('much less!')
            }
        } else if (guessNumber < goalNumber) {
            alert('try more')
            if (guessNumber + 3 >= goalNumber) {
                alert('just a bit')
            } else {
                alert('much more!')
            }
        }

        while (guessNumber !== goalNumber && isRoundOn && isGameOn) {
            if (errors === 4) {
                alert('well, you suck at this. Keep trying.')
                rounds.push({ wasRoundWon: false, tries: counter })
                counter = 1;
                errors = 0;
                goalNumber = Math.floor(Math.random() * 10) + 1;
                isRoundOn = false;
                continue
            }

            guessInput = prompt('guess number again');
            guessNumber = Number(guessInput);

            if (guessNumber !== goalNumber) {
                errors++
            }

            if (guessInput === null) {
                alert('ok bye');
                isGameOn = false;
            } else if (guessInput.trim() === '' || isNaN(guessNumber)) {
                alert('A NUMBER!');
            } else if (guessNumber > goalNumber) {
                alert('try less')
                if (guessNumber - 3 <= goalNumber) {
                    alert('just a bit')
                } else {
                    alert('much less!')
                }
            } else if (guessNumber < goalNumber) {
                alert('try more')
                if (guessNumber + 3 >= goalNumber) {
                    alert('just a bit')
                } else {
                    alert('much more!')
                }
            }
            counter++;
        }

        if (guessNumber === goalNumber) {
            rounds.push({ wasRoundWon: true, tries: counter })
            counter = 1;
            roundsWon++;
            errors = 0;
            isRoundOn = false;
            goalNumber = Math.floor(Math.random() * 10) + 1;
            if (roundsWon === 3) {
                isGameOn = false;
                var baseMsg = `win! Here's your game data:\n`
                for (var index = 0; index < rounds.length; index++) {
                    baseMsg = baseMsg + `ROUND ${index + 1}: ${rounds[index].tries}\n`
                }
                if (rounds.length === 3) {
                    alert(`${baseMsg}\n0.0`)
                } else if (rounds.length <= 5) {
                    alert(`${baseMsg}\nquite good`)
                } else if (rounds.length <= 7) {
                    alert(`${baseMsg}\nmeh`)
                } else {
                    alert(`${baseMsg}\nyou needed way too much tries`)
                }
            } else {
                alert(`keep going! Let's play another round. You need ${3 - roundsWon} more rounds!`)
            }
        }
    }
} else {
    alert('ok, bye')
}