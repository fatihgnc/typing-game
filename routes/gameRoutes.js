const router = require('express').Router()
const gameController = require('../controllers/gameController')

router
    .get('/', gameController.renderHome)

module.exports = router