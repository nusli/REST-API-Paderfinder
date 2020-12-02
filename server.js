if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config
}

const passport = require('passport')
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
    async (stammName) => {
    try {
        const stamm = await Stamm.findOne({ name: stammName });
        return stamm;
    } catch (err) {
        console.log('Konnte Stamm nicht finden', stammName);
        return null;
    }},
    async (stammId) => {
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

// current time in video: 12:58

//Zum Fixen von lokalen CORS-Probleme -> später andere Lösung suchen
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
  }); 

mongoose.connect(process.env.DATABASE_URL, { useNewUrlParser: true})
const db = mongoose.connection
db.on('error', (error) => console.error(error))
db.once('open', () => console.log('Connected to Database'))

app.use(express.json())

const stammImport = require('./routes/staemme')
const staemmeRouter = stammImport.router
app.use('/staemme', staemmeRouter)
const aktivitaetenRouter = require('./routes/aktivitaeten')
app.use('/aktivitaeten', aktivitaetenRouter)
const postRouter = require('./routes/posts')
app.use('/posts', postRouter)
const newsRouter = require('./routes/newsRouter')
app.use('/news', newsRouter)

// debug
function checkNotAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
      console.log("already authenticated")
    }
    next()
  } 

app.post('/login', checkNotAuthenticated, passport.authenticate('local', {
    failureFlash: true
}),
  function(req, res) {
    // If this function gets called, authentication was successful.
    // `req.user` contains the authenticated user.
    
    console.log("login successful", req.user)
    res.json({ message: "Login " + req.user})
  }) 
/*
app.post('/login', (req, res) => {
    console.log("trying to login")
    res.json({message: "logging in ..."})
})  */

app.post('/register', async (req, res) => {
    console.log("Registrierungsanfrage")
    const createStamm = stammImport.createStamm;
    
    try {
        let newStamm = await createStamm(req);
        //res.status(201).json(newStamm);
        res.redirect('http://localhost:4200/login');
        
    } catch (err) {
        res.status(400 /* wrong user input */).json({message: err.message})
        return;
    }
    

    
})

app.listen(3000, () => console.log('Server has started'))