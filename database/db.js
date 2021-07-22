const chalk = require('chalk')
const { Sequelize, DataTypes, Model } = require('sequelize')
require('dotenv').config()

// function to find the best game through all games of every user
Array.prototype.theBestPerformance = function (correct, incorrect, percentage) {
    return (this.length && this.reduce((best, current) => {

        best[correct] = best[correct] || 0
        best[incorrect] = best[incorrect] || 0
        best[percentage] = best[percentage] || 0

        const { currentTotal, bestTotal } = calculateScore(current, best)

        // if total score of the current game is below 0 in the first iteration, 
        // i have to assign the current to the best game because best game's stats are all 0 at first.
        if (currentTotal < 0 && !best) {
            best = { ...current }
        } else {
            if (currentTotal >= bestTotal) {
                best = { ...current }
            }
        }

        return best
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
                        const bestGame = filteredGameStats.theBestPerformance('correct', 'incorrect', 'percentage')
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
    sortUsersGames(current, best) {
        const { currentTotal, bestTotal } = calculateScore(current, best)

        if (currentTotal < bestTotal) {
            return 1
        }

        if (bestTotal < currentTotal) {
            return -1
        }

        return 0
    }
}

// Coefficients for score calculation
const CORRECT_COEFFICIENT = 0.75
const INCORRECT_COEFFICIENT = 0.125
const PERCENTAGE_COEFFICIENT = 0.25

/**
 * Calculates total scores of given games.
 * 
 * @param {*} currentGame current game stats
 * @param {*} bestGame best game stats
 * @returns the total calculated score of both current and best game.
 */
function calculateScore(currentGame, bestGame) {
    const currCorrectContribution = currentGame.correct * CORRECT_COEFFICIENT
    const currIncorrectContribution = currentGame.incorrect * INCORRECT_COEFFICIENT
    const currPercentageContribution = currentGame.percentage * PERCENTAGE_COEFFICIENT

    const bestCorrectContribution = bestGame.correct * CORRECT_COEFFICIENT
    const bestIncorrectContribution = bestGame.incorrect * INCORRECT_COEFFICIENT
    const bestPercentageContribution = bestGame.percentage * PERCENTAGE_COEFFICIENT

    const currentTotal = currCorrectContribution + currPercentageContribution - currIncorrectContribution
    const bestTotal = bestCorrectContribution + bestPercentageContribution - bestIncorrectContribution

    return {
        currentTotal,
        bestTotal
    }
}

module.exports = MySQL