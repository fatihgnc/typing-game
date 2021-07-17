const fs = require('fs')

/**
 * Method, used to read words from the specified file.
 * @param path - Path to file. 
 * @returns - All words in a mixed way.
 */

const getWordsFromFile = (path) => {
    // reading words from txt file and splitting them from new line
    let plainWords = []
    const buffer = fs.readFileSync(path)
    plainWords = buffer.toString().split(/\s/g)
    // console.log(words.length)

    // shuffling words
    let shuffledWords = []
    for(let i = 0; i < plainWords.length; i++) {
        let randomIndex = Math.floor(Math.random() * (plainWords.length - 1))
        shuffledWords.push(plainWords[randomIndex])
    }

    return shuffledWords
}

module.exports = { getWordsFromFile }
