(async () => {
    const { Sequelize, DataTypes } = require('sequelize')
    const MySQL = require('../database/db')
    const db = new MySQL(Sequelize, DataTypes)
    await db.checkConnection()
    const User = await require('../models/User')(db.sequelize, DataTypes)

    exports.insertUser = async (req, res) => {
        // console.log('out try')
        try {
            // console.log('in try')
            const user = await db.insertRecord(User, { ...req.body })
            // console.log('done');
            res.status(201).send(user)
        } catch (err) {
            res.status(400).send(err.errors[0].message)
        }
    }
})()

