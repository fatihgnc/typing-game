const router = require('express').Router()
const gameController = require('../controllers/gameController')

router
    .get('/', (req, res) => {
        gameController.renderHome(req, res)
    })
    .get('/play', async (req, res) => {
        await gameController.renderPlay(req, res)
    })
    .get('/getWords', (req, res) => {
        gameController.getWords(req, res)
    })
    .get('/play/leaderboard', async (req, res) => {
        await gameController.renderLeaderboard(req, res)
    })

module.exports = router