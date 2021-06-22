const fs = require('fs')
let words = []

// reading words from txt file and splitting them from new line
const buffer = fs.readFileSync('./kelime-listesi.txt')
let allWords = buffer.toString().split(/\s/g)
allWords.forEach(word => words.push(word))

// console.log(words.length)