const router = require('express').Router()
const gameController = require('../controllers/gameController')

router
    .get('/', gameController.renderHome)
    .get('/play', gameController.renderPlay)
    .get('/getWords', gameController.readWords)

module.exports = router