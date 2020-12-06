const { authenticate } = require("passport")

const LocalStrategy = require("passport-local").Strategy
const bcrypt = require('bcrypt')

function initialize(passport, getStammByName, getStammById) {
    async function authenticateUser(stammName, password, done) {
        console.log("authenticating ...", stammName, password)
        const stamm = await getStammByName(stammName)
        if (stamm == null) {
            console.log('Kein Stamm mit diesem Namen')
            return done(null, false, {message: 'Kein Stamm mit diesem Namen'})
        }
        console.log("passwort check")
        try {
            if (await bcrypt.compare(password, stamm.passwort)){
                return done(null, stamm)
            } else {
                return done(null, false, {message: 'Falsches Passwort.'})
            }
        } catch (err) {
            
        }
    }
    passport.use(new LocalStrategy({usernameField: 'stammName'},
    authenticateUser))
    passport.serializeUser((user, done) => { done(null, user.id)})
    passport.deserializeUser((user, done) => { 
        done(null, getStammById)
    })
}

module.exports = initialize