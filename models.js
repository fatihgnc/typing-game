module.exports = async function () {
    const chalk = require('chalk')
    const MySQL = require('./database/db')
    const db = new MySQL()

    // creating user model
    class User extends db.Model { }

    User.init({
        username: {
            type: db.DataTypes.STRING,
            allowNull: false,
            unique: !0,
            validate: {
                len: {
                    args: [3, 15],
                    msg: 'Username must be between 3-15 characters!'
                }
            }
        },
        highScore: {
            type: db.DataTypes.MEDIUMINT,
            defaultValue: 0
        }
    }, {
        tableName: 'users',
        sequelize: db.sequelize,
        freezeTableName: true
    })

    // creating game model
    class Game extends db.Model { }

    Game.init({
        correct: {
            type: db.DataTypes.INTEGER,
            defaultValue: 0
        },
        incorrect: {
            type: db.DataTypes.INTEGER,
            defaultValue: 0
        },
        percentage: {
            type: db.DataTypes.FLOAT,
            defaultValue: 0
        }
    }, {
        tableName: 'games',
        sequelize: db.sequelize,
        freezeTableName: true
    })

    // one to many relationship 
    // a user can have many game records
    User.hasMany(Game, { constraints: false })
    Game.belongsTo(User)

    await db.sequelize.sync()
    console.log(chalk.greenBright('synced all models'))

    return { User, Game, db }
}