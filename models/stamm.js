const mongoose = require('mongoose')

const stammSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    reg_datum: {
        type: Date,
        required: true,
        default: Date.now
    },
    ansprechpartner: String,
    telefon: String,
    email: {
        type: String,
        required: true
    },
    passwort: {
        type: String,
        required: true
    },
    beschreibung: String,
    adresse: {
        strasse: String,
        hausnummer: String,
        plz: String,
        ort: String
    },
    mitglieder: {
        type: Number,
        validate: {
            validator : Number.isInteger,
            message: '{VALUE} is not an integer'
        }
    }
})

module.exports = mongoose.model("Stamm", stammSchema)