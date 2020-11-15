const mongoose = require('mongoose')

const aktivitaetSchema = new mongoose.Schema({
    titel: {
        type: String,
        required: true
    },
    datum: {
        type: Date
    },
    stamm_id: String,
    ort: String,
    beschreibung: String,
    regelmaessig: Boolean,
    max_teilnehmerzahl: {
        type: Number,
        validate: {
            validator : Number.isInteger,
            message: '{VALUE} is not an integer'
        }
    },
    min_teilnehmerzahl: {
        type: Number,
        validate: {
            validator : Number.isInteger,
            message: '{VALUE} is not an integer'
        }
    },
    art: {
        type: String,
        enum: ['Sommerlager', 'Neuigkeit', 'Spendenaktion', 'Treffen', 'Sonstiges']
    }
})

module.exports = mongoose.model("Aktivitaet", aktivitaetSchema)