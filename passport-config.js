const { authenticate } = require("passport")

const LocalStrategy = require("passport-local").Strategy
const bcrypt = require('bcrypt')

function initialize(passport, getStammByName, getStammById) {
    async function authenticateUser(stammName, password, done) {
        const stamm = getStammByName(stammName)
        if (stamm == null) {
            return done(null, false, {message: 'Kein Stamm mit diesem Namen'})
        }

        try {
            if (await bcrypt.compare(password, stamm.passwort)){
                return done(null, stamm)
            } else {
                return done(null, flase, {message: 'Falsches Passwort.'})
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