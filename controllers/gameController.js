(async () => {
    const { getWordsFromFile } = require('../utils/wordOperations')
    const path = require('path')
    const pathToFile = path.join(__dirname, '../kelime-listesi.txt')
    
    const { User, Game, db } = await require('../models')()
    
    exports.renderHome = async (req, res) => {
        const redirectMsg = req.query.redirectMsg

        if(redirectMsg) {
            return res.render('index.ejs', {
                title: 'Home',
                redirectMsg
            })
        }

        res.status(200).render('index.ejs', {
            title: 'Home',
            redirectMsg: null
        })
    }

    exports.renderPlay = async (req, res) => {
        const username = req.query.username

        // we check here that there is a username value in the query string
        if (!username) {
            return res.render('index.ejs', {
                title: 'Ana sayfa',
                redirectMsg: 'önce kullanıcı adı girmeniz gerekmekte!'
            })
        }

        // validation
        if(username.length < 3 || username.length > 15) {
            return res.render('index.ejs', {
                title: 'Ana sayfa',
                redirectMsg: 'kullanıcı adı 3-15 karaktere sahip olabilir!'
            })
        }

        // if a user directly goes to /play with some username value in the query string, i make sure 
        // that it gets saved in the database
        const user = await db.getSingleUser(User, username)

        if(!user) 
            await db.insertUser(User, username)
            
        res.render('play.ejs', {
            title: 'Play'
        })
    }

    // fetching words from the txt file and sending them to front end
    exports.getWords = (req, res) => {
        const words = getWordsFromFile(pathToFile)
        res.send(words)
    }

    exports.renderLeaderboard = async (req, res) => {
        try {
            const games = await db.getEveryUsersBestGame(Game, User)

            if(!games) {
                return res.render('leaderboard.ejs', {
                    title: 'Leaderboard',
                    games: []
                })
            }

            // console.log(games)

            res.render('leaderboard.ejs', {
                title: 'Leaderboard',
                games
            })

        } catch (err) {
            res.status(500).send(err)
        }
    }
})()