const express = require('express')
const morgan = require('morgan')
const helmet = require('helmet')
const cors = require('cors')
const path = require('path')
require('dotenv').config()

const userRouter = require('./routes/userRoutes')
const gameRouter = require('./routes/gameRoutes')

const app = express()
const PORT = process.env.PORT || 3000

// setting ejs as the templating language
app.set('view engine', 'ejs')

// middlewares
app.use(cors())
app.use(helmet({ contentSecurityPolicy: false }))
app.use(express.json())
app.use(express.static(path.join(__dirname, 'public')))
app.use(express.urlencoded({ extended: false }))
app.use(morgan('combined'))

// routes
app.use('/', gameRouter)
app.use('/user', userRouter)

app.listen(PORT, () => console.log(`server listening on port: ${PORT}`))

module.exports = app
