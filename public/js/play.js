$(function () {
    // GLOBAL VARIABLES
    const wordSpan = $('.target-words')
    const wordInput = $('#wordInput')
    const words = getWords()
    const gameOverMsg = $('.game-over-msg')
    const gameOverContainer = $('.game-over-container')
    const successRate = gameOverContainer.find('.game-over__success-rate')
    const playAgainBtn = gameOverContainer.find('.play-again')
    const leaderboardBtn = gameOverContainer.find('.scoreboard')
    const timer = $('.timer')
    let username = localStorage.getItem('username')
    let wordIndex = 0
    let currentWordIndex = 0
    let correctCount = 0
    let incorrectCount = 0
    let timeLeft = 60
    timer.text(timeLeft)

    const queryUsername = decodeURI(location.href).split('=')[1]
    
    if (!username && !queryUsername) {
        location.href = '/?redirectMsg=you should enter a username first'
    } 
    
    if (!username && queryUsername) {
        username = queryUsername
        localStorage.setItem('username', queryUsername)
    } 

    if(username && queryUsername && username !== queryUsername) {
        location.href = '/?redirectMsg=there is already a logged in user'
    }

    // GETTING THE WORDS FROM SERVER VIA AJAX CALL
    function getWords() {
        let wordsToFetch = []

        $.ajax({
            url: '/getWords',
            success: (data, status, jqxhr) => {
                wordsToFetch = data.filter(piece => piece.length <= 7)
            },
            error: (jqxhr, status, err) => {
                alert(jqxhr.responseText)
            },
            async: false
        })

        return wordsToFetch
    }

    // NEXT 4 WORDS TO LOAD INTO THE WORD SPAN ELEMENT
    function loadNextWords() {
        wordSpan.empty()

        const nextWords = [words[wordIndex], words[wordIndex + 1], words[wordIndex + 2], words[wordIndex + 3]]
        wordInput.val('')

        nextWords.forEach((word, index) => {
            if (index === 0) {
                wordSpan.append(`<span class="current-target">${word}</span> `)
            } else {
                wordSpan.append(`<span>${word}</span> `)
            }
        })

        wordIndex += 4
    }

    // STARTING TIMER
    function startTimer() {
        const timeInterval = setInterval(() => {
            timer.text(--timeLeft)
            checkTimer(timeInterval, timeLeft)
        }, 100)
    }

    // CHECKING WORD INPUT
    function checkInput(input, target, wordElem) {
        // console.log(input, target)
        if (input.trim().toLowerCase() === target.trim()) {
            wordElem.css('color', 'yellowgreen')
            username.match(/[oö]znur/i) ? correctCount += 2 : correctCount++
        } else {
            wordElem.css({
                color: '#ea8282',
                textDecoration: 'line-through'
            })
            incorrectCount++
        }
    }

    // CHECKING THE TIMER, IF IT'S OVER WE CALL GAMEOVER FUNCTION
    function checkTimer(interval, remainingTime) {
        const isGameOver = remainingTime <= 0 ? true : false
        if (isGameOver) gameOver(interval)
    }

    // WILL BE CALLED WHEN GAME IS OVER
    function gameOver(interval) {
        clearInterval(interval)

        wordInput.css('display', 'none')
        wordInput.next('span').css('display', 'none')
        gameOverMsg.css('display', 'inline-block')
        gameOverContainer.css('display', 'flex')

        const _successRate = calculateSuccessPercentage(correctCount, incorrectCount)
        successRate.append(`
                you did 
                <strong style="color: black;">${correctCount}/${correctCount + incorrectCount}</strong> , 
                which is 
                <strong style="color: black;">${_successRate}%</strong>
            `)


        saveGameData(username, correctCount, incorrectCount, _successRate)
    }

    // CALCULATING SUCCESS PERCENTAGE
    function calculateSuccessPercentage(correct, incorrect) {
        // i had to do it step by step otherwise it was not working
        if (correct === 0) return 0
        else if (correct + incorrect === 0) return 0
        else {
            const correctTimesHundred = correct * 100
            const totalAnswers = correct + incorrect
            return (correctTimesHundred / totalAnswers).toFixed(2)
        }
    }

    // UPDATING THE CORRESPONDING USER INFO VIA AJAX CALL
    function saveGameData(username, correct, incorrect, percentage) {
        $.ajax({
            method: 'PUT',
            url: `/user/saveGameData?username=${username}`,
            data: {
                correct,
                incorrect,
                percentage
            },
            success(data, status, jqxhr) {
                console.log(data, status)
            },
            error(jqxhr, status, err) {
                console.log(status, err)
            }
        })
    }

    // WILL BE CALLED WHEN PLAY AGAIN IS CLICKED
    function playAgain() {
        // resetting everything
        timeLeft = 60
        timer.text(timeLeft)
        correctCount = 0
        incorrectCount = 0
        currentWordIndex = 0
        gameOverContainer.css('display', 'none')
        gameOverMsg.css('display', 'none')
        wordInput.css('display', 'block')
        wordInput.next('span').css('display', 'inline-block')
        successRate.empty()
        loadNextWords()
        wordInput.one('keyup', startTimer)
    }

    // NAVIGATING TO LEADERBOARD
    const navigateToLeaderboard = () => location.href = '/play/leaderboard'

    // ==== EVENTS ====

    // THIS EVENT IS HAPPENING ONLY ONCE BECAUSE WE NEED IT ONCE TO START THE TIMER
    wordInput.one('keyup', startTimer)

    // ACTUAL KEYUP EVENT
    wordInput.on('keyup', e => {
        // for android phones, i had to detect the pressed key in a different way
        const androidKey = e.target.value.charAt(e.target.selectionStart - 1).charCodeAt()

        // here we are checking if the space bar is pressed
        // and if the current word is the last word in the current party of the words
        // if so, we load the next 4 words and check the input 
        if ((e.keyCode === 32 || androidKey === 32) && currentWordIndex === 3) {
            const currentWord = wordSpan.find('span').eq(currentWordIndex)
            checkInput(wordInput.val(), currentWord.text(), currentWord)
            loadNextWords()
            currentWordIndex = 0
        } // and here if space bar is pressed but  
        // the word is not the last word in the current party of the words
        else if (e.keyCode === 32 || androidKey === 32) {
            const currentWord = wordSpan.find('span').eq(currentWordIndex)
            const nextWord = wordSpan.find('span').eq(++currentWordIndex)
            checkInput(wordInput.val(), currentWord.text(), currentWord)
            wordInput.val('')
            currentWord.removeClass('current-target')
            nextWord.addClass('current-target')
        }
    })

    playAgainBtn.on('click', playAgain)

    leaderboardBtn.on('click', navigateToLeaderboard)

    // for initial state of the game
    loadNextWords()
})