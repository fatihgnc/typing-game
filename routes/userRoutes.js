const express = require('express')
const userController = require('../controllers/userController')
const router = express.Router()

router
    .post('/add', async (req, res) => {
        await userController.insertUser(req, res)
    })
    .put('/saveGameData', async (req, res) => {
        await userController.insertGameData(req, res)
    })

module.exports = router