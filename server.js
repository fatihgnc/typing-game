(async () => {
    // imports 
    const express = require('express')
    const morgan = require('morgan')
    const bodyParser = require('body-parser')
    const path = require('path')
    await require('dotenv').config()

    const userRouter = require('./routes/userRoutes')
    const gameRouter = require('./routes/gameRoutes')

    const app = express()
    const PORT = process.env.PORT || 3000

    // setting ejs as the templating language
    app.set('view engine', 'ejs')
    
    // middlewares
    app.use(express.json())
    app.use(express.static(path.join(__dirname, 'public')))
    app.use(morgan('dev'))
    app.use(bodyParser.json())
    app.use(bodyParser.urlencoded({ extended: false }))
    app.use('/', gameRouter)
    app.use('/user', userRouter)

    app.listen(PORT, () => console.log(`server listening on port: ${PORT}`))
})()