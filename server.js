const express = require('express')
const app = express()
const mongoose = require('mongoose')
require('dotenv').config()

// current time in video: 12:58

mongoose.connect(process.env.DATABASE_URL, { useNewUrlParser: true})
const db = mongoose.connection
db.on('error', (error) => console.error(error))
db.once('open', () => console.log('Connected to Database'))

app.use(express.json())

const staemmeRouter = require('./routes/staemme')
app.use('/staemme', staemmeRouter)
const aktivitaetenRouter = require('./routes/aktivitaeten')
app.use('/aktivitaeten', aktivitaetenRouter)
const postRouter = require('./routes/posts')
app.use('/posts', postRouter)
const newsRouter = require('./routes/newsRouter')
app.use('/news', newsRouter)

app.listen(3000, () => console.log('Server has started'))