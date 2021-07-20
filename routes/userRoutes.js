const express = require('express')
const userController = require('../controllers/userController')
const router = express.Router()

router
    .post('/add', async (req, res) => {
        await userController.insertUser(req, res)
    })
    .post('/saveGameData', async (req, res) => {
        await userController.insertUsersGameData(req, res)
    })

module.exports = router