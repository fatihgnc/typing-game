const chalk = require('chalk')

// creating user module and exporting it
module.exports = async (sequelize, DataTypes) => {
    const User = sequelize.define('User', {
        id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey: !0,
            autoIncrement: !0
        },
        username: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: !0
        },
        points: {
            type: DataTypes.INTEGER,
            defaultValue: 0
        }
    }, {
        tableName: 'users'
    })

    await User.sync({ force: !0 })
    console.log(chalk.greenBright('synced'))
    
    return User
}
