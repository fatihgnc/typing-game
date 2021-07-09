const chalk = require('chalk')
const { Sequelize, DataTypes, Model } = require('sequelize')
require('dotenv').config()

// connecting db and passing sequelize instance to mysql class
const sequelize = new Sequelize (process.env.DB_NAME, process.env.DB_USERNAME, process.env.DB_PASSWORD, {
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
    async insertUser (User, username) {
        try {
            const user = User.build({ username })
            await user.save()
            console.log(chalk.greenBright('Record saved to database succesfully.'))
            return user
            
        } catch (err) {
            console.error(err)
        }
    }
    
    /**
     * Function to fetch user through username value.
     * 
     * @param {*} User user model
     * @param {*} username username value of the record to fetch from db
     * @returns fetched user
     */
    async getUser (User, username) {
        try {
            const user = await User.findAll({ where: { username } })
            return user
            
        } catch (err) {
            console.error(err)
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
    async checkUserHighScore (User, Game, username) {
        try {
            const user = await this.getUser(User, username)
            const userHighScore = user[0].dataValues.highScore
            const highScore = await Game.max('correct', { where: { UserId: user[0].dataValues.id } })
            if(userHighScore < highScore){
                await User.update({ highScore }, {
                    where: { username }
                })
                console.log(chalk.greenBright(`highscore of ${username} is updated from ${userHighScore} to ${highScore}`))
            }

        } catch (err) {
            console.error(err)
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
    async insertGameRecord (Game, User, username, { correct, incorrect, percentage }) {
        try {
            const user = await this.getUser(User, username)
            console.log(correct, incorrect, percentage)
            if(user[0] == 0) {
                return new Error('user not found')
            }

            const UserId = user[0].dataValues.id
            const game = Game.build({
                correct,
                incorrect,
                percentage,
                UserId
            })

            await game.save()
            console.log(chalk.greenBright('game data saved to db succesfully !!'))

        } catch (err) {
            console.error(err)
        }
    }
}

module.exports = MySQL