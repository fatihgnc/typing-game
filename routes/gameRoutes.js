const router = require('express').Router()
const gameController = require('../controllers/gameController')

router
    .get('/', gameController.renderHome)
    .get('/play', gameController.renderPlay)

module.exports = router