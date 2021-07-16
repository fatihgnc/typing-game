const chalk = require('chalk')
const { Sequelize, DataTypes, Model } = require('sequelize')
require('dotenv').config()

Array.prototype.hasMost = function (attr, attr2) {
    return (this.length && this.reduce((acc, curr) => {
        acc[attr] = acc[attr] || 0
        acc[attr2] = acc[attr2] || 0 

        if (curr[attr] >= acc[attr] && curr[attr2] >= acc[attr2]) { acc = { ...curr } }

        return acc
    }, {}))
}

// connecting db and passing sequelize instance to mysql class
const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USERNAME, process.env.DB_PASSWORD, {
    host: 'localhost',
    dialect: 'mysql',
    pool: {
        max: 5,
        min: 0,
        idle: 10000
    }
})
class MySQL {

    constructor() {
        this.DataTypes = DataTypes
        this.Model = Model
        this.Sequelize = Sequelize
        this.sequelize = sequelize
    }

    /**
     * Function to insert user to db.
     * 
     * @param {*} User user model 
     * @param {*} username username to be assigned as the username of the record to be inserted
     * @returns the inserted user
     */
    async insertUser(User, username) {
        try {
            const user = User.build({ username })
            await user.save()
            console.log(chalk.greenBright('User saved to database succesfully.'))
            return user

        } catch (err) {
            throw err
        }
    }

    /**
     * Function to fetch user through username value.
     * 
     * @param {*} User user model
     * @param {*} username username value of the record to fetch from db
     * @returns fetched user
     */
    async getSingleUser(User, username) {
        try {
            const user = await User.findAll({ where: { username }, limit: 1 })

            if (!user.length) {
                return console.log(chalk.red(`User with username: ${username} is not found in database.`))
            }

            return user

        } catch (err) {
            throw err
        }
    }

    async getAllUsers(User) {
        try {
            const users = await User.findAll()

            if (!users.length) {
                return console.log(chalk.red('There is no user record in database.'))
            }

            return users

        } catch (err) {
            throw err
        }
    }

    async getAllGames(Game) {
        try {
            const games = await Game.findAll()

            if (!games.length) {
                return console.log(chalk.red('There is no game record in database.'))
            }
            
            return games

        } catch (err) {
            throw err
        }
    }

    /**
     * Function to check user's high score with the newly ended game's score.
     * If the new score is greater than the previous high score, we update it.
     * 
     * @param {*} User user model 
     * @param {*} Game game model
     * @param {*} username username value of the user record
     * @returns void
     */
    async checkUserHighScore(User, Game, username) {
        try {
            const user = await this.getSingleUser(User, username)
            const userHighScore = user[0].dataValues.highScore
            const highScoreCandidate = await Game.max('correct', { where: { UserId: user[0].dataValues.id } })
            
            if (userHighScore < highScoreCandidate) {
                await User.update({ highScore: highScoreCandidate }, {
                    where: { username }
                })
                console.log(chalk.greenBright(`Highscore of ${username} is updated from ${userHighScore} to ${highScoreCandidate}.`))
            }

        } catch (err) {
            throw err
        }
    }

    /**
     * 
     * @param {*} Game game model 
     * @param {*} User user model
     * @param {*} username username of the user
     * @param {*} param3 game data of newly ended game
     * @returns void
     */
    async insertGameRecord(Game, User, username, { correct, incorrect, percentage }) {
        try {
            const user = await this.getSingleUser(User, username)
            const UserId = user[0].dataValues.id
            const game = Game.build({
                correct,
                incorrect,
                percentage,
                UserId
            })

            await game.save()
            console.log(chalk.greenBright('Game data saved to db succesfully.'))

        } catch (err) {
            throw err
        }
    }

    async getEveryUsersBestGame(Game, User) {
        try {
            const users = await this.getAllUsers(User)
            const games = await this.getAllGames(Game)
            // console.log(users, games)

            const usersBestGames = []

            if (users && games) {

                // looping through every user and finding their game records
                for await(const user of users) {
                    const userGames = await Game.findAll({ where: { UserId: user.dataValues.id } })
                    
                    // extracting the games as an array in the format we want
                    const rawGameStats = userGames.map(game => ({
                        username: user.dataValues.username,
                        ...game.dataValues
                    }))

                    // removing unwanted properties from stats
                    const filteredGameStats = rawGameStats.map(stats => {
                        delete stats['id']
                        delete stats['updatedAt']
                        delete stats['UserId']
                        return stats
                    })

                    // here we are finding the best performance of the current user and pushing it to the best games
                    const bestGame = filteredGameStats.hasMost('correct', 'percentage')
                    usersBestGames.push(bestGame)
                }
            }

            return usersBestGames

        } catch (err) {
            throw err
        }
    }
}

module.exports = MySQL