const chalk = require('chalk')

class MySQL {    
    constructor(sequelize, dataTypes) {
        this.sequelize = new sequelize(process.env.DB_NAME, process.env.DB_USERNAME, process.env.DB_PASSWORD, {
            host: 'localhost',
            dialect: 'mysql',
            pool: {
                max: 5,
                min: 0,
                idle: 10000
            }
        })
        this.dataTypes = dataTypes
    }

    /**
     * Function to check whether the connection to database established successfully.
     * 
     * @returns status message, success/fail.
     */
    async checkConnection () {
        try {
            await this.sequelize.authenticate()
            console.log(chalk.greenBright('connected to db successfully'))
        } catch (e) {
            console.log(chalk.red(e))
        }
    }

    /**
     * Function to insert record to MySQL database asynchronously through Sequelize.
     * 
     * @param User - Data model. 
     * @param body - Body of the data to be inserted into the db.
     * @returns - Inserted record.
     */
    async insertRecord (User, body) {
        const user = User.build(body)
        
        try {
            await user.save()
            console.log(chalk.greenBright('Record saved to database succesfully.'))
            return user
        } catch (e) {
            throw e
        }
    }
}

module.exports = MySQL