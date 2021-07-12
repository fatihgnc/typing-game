const chalk = require('chalk')
const { Sequelize, DataTypes, Model } = require('sequelize')
require('dotenv').config()

Array.prototype.hasMost = function (attrib, attrib2) {
    return (this.length && this.reduce((acc, curr) => {
        acc[attrib] = acc[attrib] || 0
        acc[attrib2] = acc[attrib2] || 0 

        if (curr[attrib] > acc[attrib] && curr[attrib2] > acc[attrib2]) { acc = { ...curr } }

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
            return user

        } catch (err) {
            throw err
        }
    }

    async getAllUsers(User) {
        try {
            const users = await User.findAll()

            if (users) {
                return users
            }

            console.log(chalk.red('There is no user record in database.'))

        } catch (err) {
            throw err
        }
    }

    async getAllGames(Game) {
        try {
            const games = await Game.findAll()

            if (games) {
                return games
            }

            console.log(chalk.red('There is no game record in database.'))

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
            const highScore = await Game.max('correct', { where: { UserId: user[0].dataValues.id } })
            if (userHighScore < highScore) {
                await User.update({ highScore }, {
                    where: { username }
                })
                console.log(chalk.greenBright(`Highscore of ${username} is updated from ${userHighScore} to ${highScore}.`))
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
            console.log(correct, incorrect, percentage)
            if (user[0] == 0) {
                return new Error('User not found')
            }

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

            const userBestGames = []

            if (users && games) {
                for await(const user of users) {
                    const userGames = await Game.findAll({ where: { UserId: user.dataValues.id } })
                    const gameStats = userGames.map(game => ({
                        username: user.dataValues.username,
                        ...game.dataValues
                    }))
                    delete gameStats.updatedAt
                    const bestGame = gameStats.hasMost('correct', 'percentage')
                    userBestGames.push(bestGame)
                }
            }

            // console.log(userBestGames)
            return userBestGames

        } catch (err) {
            console.log(err)
        }
    }
}

module.exports = MySQL