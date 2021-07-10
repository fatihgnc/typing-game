(async () => {
    const { getWordsFromFile } = require('../words/wordOperations')
    const path = require('path')
    const pathToFile = path.join(__dirname, '../kelime-listesi.txt')
    
    const createModels = require('../models')
    const { User, Game, db } = await createModels()
    
    exports.renderHome = (req, res) => {
        res.render('index.ejs', {
            title: 'Home',
            redirectMsg: null
        })
    }

    exports.renderPlay = async (req, res) => {
        const username = req.query.username

        // we check here that there is a username value in the query string
        if (!username) {
            return res.render('index.ejs', {
                title: 'Home',
                redirectMsg: 'You should enter a username first!'
            })
        }

        if(username.length < 3 || username.length > 15) {
            return res.render('index.ejs', {
                title: 'Home',
                redirectMsg: 'Username must be between 3-15 characters!'
            })
        }

        // if a user directly goes to /play with some username in the query string, i make sure 
        // that it gets saved in the database
        const user = await db.getUser(User, username)

        if(user.length === 0) {
            await db.insertUser(User, username)
            // console.log(user)
        }
        
        res.render('play.ejs', {
            title: 'Play'
        })
    }

    // fetching words from the txt file and sending them to front end
    exports.getWords = (req, res) => {
        const words = getWordsFromFile(pathToFile)
        res.send(words)
    }
})()