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

const fileUpload = require('express-fileupload');
app.use(fileUpload());

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

//Zum Fixen von lokalen CORS-Probleme -> später andere Lösung suchen
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    next();
  }); 

// current time in video: 12:58

//Zum Fixen von lokalen CORS-Probleme -> später andere Lösung suchen
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', 'http://localhost:4200');
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    res.header('Access-Control-Allow-Credentials', true);
    res.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS, PUT, DELETE, PATCH")
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
const imageRouter = require('./routes/images')
app.use('/images', imageRouter)

// debug
function checkNotAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
      console.log("already authenticated")
    }
    next()
  } 

app.post('/login', checkNotAuthenticated, passport.authenticate('local'),
  function(req, res) {
    // If this function gets called, authentication was successful.
    // `req.user` contains the authenticated user.
    /*
    req.login(req.user, (err) => {
        console.log('Inside req.login() callback')
        console.log(`req.session.passport: ${JSON.stringify(req.session.passport)}`)
        console.log(`req.user: ${JSON.stringify(req.user)}`)
      })*/
    return res.cookie("session_id", req.session.passport.user).json({ message: 
      `Session ${req.session.passport.user} established`})
  }) 
  
/*
 app.post('/login', (req, res, next) => {
    console.log('Inside POST /login callback', req.isAuthenticated(), req.session)
    passport.authenticate('local', (err, user, info) => {
      console.log('Inside passport.authenticate() callback');
      console.log(`req.session.passport: ${JSON.stringify(req.session.passport)}`)
      console.log(`req.user: ${JSON.stringify(req.user)}`)
      req.login(user, (err) => {
        console.log('Inside req.login() callback')
        console.log(`req.session.passport: ${JSON.stringify(req.session.passport)}`)
        console.log(`req.user: ${JSON.stringify(req.user)}`)
        return res.cookie("session_id", req.session.passport.user).send('You were authenticated & logged in!\n');
      })
    })(req, res, next);
  }) 
*/
app.post('/register', async (req, res) => {
    console.log("Registrierungsanfrage")
    const createStamm = stammImport.createStamm;
    
    try {
        let newStamm = await createStamm(req);
        //res.status(201).json(newStamm);
        req.login(newStamm, err => {
          if (err) return console.log("Error:", err);
          console.log("session:", req.session)
          return res.cookie("session_id", req.session.passport.user).json({ message: 
            `Session ${req.session.passport.user} established`})
        })
        
    } catch (err) {

        res.status(400 /* wrong user input */).json({message: err.message})
        return;
    }
    

    
})

app.delete('/logout', (req, res) => {
  req.logOut()
  res.clearCookie("session_id").json({message: "Successfully logged out."});
})



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

app.post('/upload', function(req, res) {
  if (!req.files || Object.keys(req.files).length === 0) {
    return res.status(400).send('No files were uploaded.');
  }

  // The name of the input field (i.e. "sampleFile") is used to retrieve the uploaded file
  let sampleFile = req.files.profile_pic;

  // Use the mv() method to place the file somewhere on your server
  sampleFile.mv('images/' + sampleFile.name, function(err) {
    if (err)
      return res.status(500).send(err);

    res.send('File uploaded!');
  });
});  

app.listen(3000, () => console.log('Server has started'))