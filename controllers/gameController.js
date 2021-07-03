const { readWordsFromFile } = require('../words/wordOperations')
const path = require('path')
const pathToFile = path.join(__dirname, '../kelime-listesi.txt')

exports.renderHome = (req, res) => {
    // console.log(1)
    res.render('index.ejs', { 
        title: 'Home',
        redirectMsg: null
    })
}

exports.renderPlay = (req, res) => {
    // console.log(words)
    if(!req.query.username) {
        return res.render('index.ejs', { 
            title: 'Home',
            redirectMsg: 'You should enter a username first!'
        })
    }
    res.render('play.ejs', {
        title: 'Play'
    })
}

exports.readWords = (req, res) => {
    const words = readWordsFromFile(pathToFile)
    res.send(words)
}