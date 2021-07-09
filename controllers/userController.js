(async () => {
    const createModels = require('../models')
    const { User, Game, db } = await createModels()    

    // inserting user to db with the username value coming from request object
    exports.insertUser = async (req, res) => {
        try {
            const username = req.body.username
            const user = await db.insertUser(User, username)
            res.status(201).send(user)
            
        } catch (err) {                             
            res.status(400).send(err.errors[0].message)
        }
    }

    // inserting game data with the id belonging to upcoming user data
    exports.insertGameData = async (req, res) => {
        try {
            const username = req.query.username
            await db.insertGameRecord(Game, User, username, req.body)
            await db.checkUserHighScore(User, Game, username)       
            res.status(201).send('game data saved to db')

        } catch (err) {
            res.status(500).send(err)
        }
    }
})()

