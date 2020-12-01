if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config
}

const express = require('express')
const flash = require('express-flash')
const session = require('express-session')
const app = express()
const mongoose = require('mongoose')
require('dotenv').config()
const Stamm = require('./models/stamm')

// initialize passport
// TODO
const initializePassport = require('./passport-config')
initializePassport(
    passport,
    name => {
    try {
        const stamm = await Stamm.findOne({ name: stammName });
        return stamm;
    } catch (err) {
        console.log('Konnte Stamm nicht finden', stammName);
        return null;
    }},
    stammId => {
    try {
        const stamm = await Stamm.findOne({ id: stammId });
        return stamm;
    } catch (err) {
        console.log('Konnte Stamm nicht finden', stammName);
        return null;
    }}
)

app.use(express.urlencoded({extended: false}))
app.use(flash())
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false
}))
app.use(passport.initialize())
app.use(passport.session())

//Zum Fixen von lokalen CORS-Probleme -> später andere Lösung suchen
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    next();
  }); 

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
const passport = require('passport')
app.use('/news', newsRouter)

app.post('/login', passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/login',
    failureFlash: true
}))



app.delete('/logout', (req, res) => {
    req.logOut()
    // TODO return something
})
/*
function checkAuthenticated(req, res, next) {
    if(req.isAuthenticated()) {
        return next()
    }
    return res.redirect('login')
}*/

app.listen(3000, () => console.log('Server has started'))