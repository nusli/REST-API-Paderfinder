const mongoose = require('mongoose')

const postSchema = new mongoose.Schema({
    titel: {
        type: String,
        required: true,
        unique: true
    },
    änderungsDatum: {
        type: Date,
        required: true,
        default: Date.now
    },
    stamm_id: String,
    art: String,
    inhalt: String,
    tags: [String]
})

module.exports = mongoose.model("Post", postSchema)