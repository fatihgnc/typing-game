const chalk = require('chalk')
const { Sequelize, DataTypes, Model } = require('sequelize')
require('dotenv').config()

// function to find the best game through all games of every user
Array.prototype.hasMost = function (attr, attr2) {
    return (this.length && this.reduce((acc, curr) => {
        acc[attr] = acc[attr] || 0
        acc[attr2] = acc[attr2] || 0

        if (curr[attr] + (curr[attr2] / 10) > acc[attr] + (acc[attr2] / 10)) {
            acc = { ...curr }
        }

        return acc
    }, {}))
}

// connecting db and passing sequelize instance to mysql class
const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USERNAME, process.env.DB_PASSWORD, {
    host: process.env.DB_HOSTNAME,
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
     * Function to insert user to database.
     * 
     * @param {*} User user model 
     * @param {*} username username to be assigned as the username of the record to be inserted
     * @returns the inserted user
     */
    async insertUser(User, username) {
        try {
            
            if(!username || username.length < 3 || username.length > 15) {
                throw new Error('Username value should be between 3-15 characters!')
            }
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
     * @param {*} username username value of the record to fetch from database
     * @returns fetched user
     */
    async getSingleUser(User, username) {
        try {
            const user = await User.findAll({ where: { username }, limit: 1 })

            if (!user.length) {
                console.log(chalk.red(`User with username: ${username} is not found in database.`))
                return null
            }

            return user

        } catch (err) {
            throw err
        }
    }

    /**
     * Gets all users from database.
     * 
     * @param {*} User user model
     * @returns all users in database if exists, a message regarding the nonexistence of records otherwise.
     */
    async getAllUsers(User) {
        try {
            const users = await User.findAll()

            if (!users.length) {
                console.log(chalk.red('There is no user record in database.'))
                return null
            }

            return users

        } catch (err) {
            throw err
        }
    }

    /**
     * Gets all games from database.
     * 
     * @param {*} Game Game model
     * @returns all games in database if exists, a message regarding the nonexistence of records otherwise.
     */
    async getAllGames(Game) {
        try {
            const games = await Game.findAll()

            if (!games.length) {
                console.log(chalk.red('There is no game record in database.'))
                return null
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
     * Inserts game record to database.
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

    /**
     * Finds all games and chooses the best one for every individual user.
     * 
     * @param {*} Game Game model
     * @param {*} User User model
     * @returns an array which consists of each user's best performed game.
     */
    async getEveryUsersBestGame(Game, User) {
        try {
            const users = await this.getAllUsers(User)
            const games = await this.getAllGames(Game)
            // console.log(users, games)

            const usersBestGames = []

            if (users && games) {

                // looping through every user and finding their game records
                for await (const user of users) {
                    const userGames = await Game.findAll({ where: { UserId: user.dataValues.id } })

                    if (userGames.length > 0) {
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
                usersBestGames.sort(this.sortUsersGames)
                // console.log(usersBestGames)
                return usersBestGames
            } 

            return null

        } catch (err) {
            throw err
        }
    }

    /**
     * Callback function for sort method.
     * 
     * @param {*} a first game 
     * @param {*} b second game
     * @returns 1, 0 or -1 according to comparison result
     */
    sortUsersGames(a, b) {
        const totalScoreA = a.correct + (a.percentage / 10)
        const totalScoreB = b.correct + (b.percentage / 10)

        if (totalScoreA < totalScoreB) {
            return 1
        }

        if (totalScoreB < totalScoreA) {
            return -1
        }

        return 0
    }
}

module.exports = MySQL