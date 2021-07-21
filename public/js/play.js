$(function () {
    // GLOBAL VARIABLES
    const wordSpan = $('.target-words')
    const wordInput = $('#wordInput')
    const instructions = $('.instructions')
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

    // Checks
    const queryUsername = decodeURI(location.href).split('=')[1]

    if (!username && !queryUsername) {
        location.href = '/?redirectMsg=önce kullanıcı adı girmeniz gerekmekte!'
    }

    if (!username && queryUsername) {
        username = queryUsername
        localStorage.setItem('username', username)
    }

    if (username && queryUsername && username !== queryUsername) {
        location.href = '/?redirectMsg=zaten giriş yapmış bir kullanıcı var!'
    }

    // Getting the words from server via ajax.
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

    // Next 4 words to load into the word span element. 
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

    // Starting timer.
    function startTimer() {
        const timeInterval = setInterval(() => {
            timer.text(--timeLeft)
            checkTimer(timeInterval, timeLeft)
        }, 1000)
    }

    // Checking the timer, if it's over we call game over function.
    function checkTimer(interval, remainingTime) {
        const isGameOver = remainingTime <= 0 ? true : false
        if (isGameOver) gameOver(interval)
    }

    // Checking word input.
    function checkInput(input, target, wordElem) {
        // console.log(input, target)
        if (input.trim().toLowerCase() === target.trim()) {
            wordElem.css('color', 'yellowgreen')
            // bonus for my gf XD
            const regex = /[oö]znur/i
            regex.test(username) ? correctCount += 2 : correctCount++
            timer.text(++timeLeft)

        } else {
            wordElem.css({
                color: '#ea8282',
                textDecoration: 'line-through'
            })
            incorrectCount++
        }
    }

    // Will be called when game is over.
    function gameOver(interval) {
        clearInterval(interval)

        wordInput.css('display', 'none')
        wordInput.next('span').css('display', 'none')
        instructions.css('display', 'none')
        gameOverMsg.css('display', 'inline-block')
        gameOverContainer.css('display', 'flex')

        const _successRate = calculateSuccessPercentage(correctCount, incorrectCount)
        successRate.append(`
                doğru sayınız: 
                <strong style="color: black;">${correctCount}/${correctCount + incorrectCount}</strong> , 
                ki bu da: 
                <strong style="color: black;">${_successRate}%</strong>
            `)

        saveGameData(username, correctCount, incorrectCount, _successRate)
    }

    // Calculating success percentage.
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

    // Saving the corresponding user game info to db via ajax. 
    function saveGameData(username, correct, incorrect, percentage) {
        $.ajax({
            method: 'POST',
            url: `/user/saveGameData?username=${username}`,
            data: {
                correct,
                incorrect,
                percentage
            }
        })
    }

    // Will be called when play again is clicked.
    function playAgain() {
        // resetting everything
        timeLeft = 60
        timer.text(timeLeft)
        correctCount = 0
        incorrectCount = 0
        currentWordIndex = 0
        gameOverContainer.css('display', 'none')
        gameOverMsg.css('display', 'none')
        wordInput.text('')
        wordInput.css('display', 'block')
        wordInput.next('span').css('display', 'inline-block')
        instructions.css('display', 'block')
        successRate.empty()
        loadNextWords()
        wordInput.one('keyup', startTimer)
    }

    // Navigating to leaderboard.
    const navigateToLeaderboard = () => location.href = '/play/leaderboard'

    // ==== EVENTS ====

    // This event is happening only once because we need it only one time in order to start the timer.
    wordInput.one('keyup', startTimer)

    // Actual keyup event.
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