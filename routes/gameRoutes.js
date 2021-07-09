const router = require('express').Router()
const gameController = require('../controllers/gameController')

router
    .get('/', async (req, res) => {
        gameController.renderHome(req, res)
    })
    .get('/play', async (req, res) => {
        await gameController.renderPlay(req, res)
    })
    .get('/getWords', async (req, res) => {
        gameController.getWords(req, res)
    })

module.exports = router