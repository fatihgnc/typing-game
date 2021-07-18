// imports 
const express = require('express')
const morgan = require('morgan')
const path = require('path')
require('dotenv').config()

const userRouter = require('./routes/userRoutes')
const gameRouter = require('./routes/gameRoutes')

const app = express()
const PORT = process.env.PORT || 5192

// setting ejs as the templating language
app.set('view engine', 'ejs')

// middlewares
app.use(express.json())
app.use(express.static(path.join(__dirname, 'public')))
app.use(morgan('dev'))
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use('/', gameRouter)
app.use('/user', userRouter)

app.listen(PORT, () => console.log(`server listening on port: ${PORT}`))

module.exports = app
