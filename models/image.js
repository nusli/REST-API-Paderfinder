/*const mongoose = require('mongoose')

const imageSchema = new mongoose.Schema({
    img: { data: Buffer, contentType: String }
})

module.exports = mongoose.model("Image", imageSchema)
*/
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ImageSchema = new Schema({
    caption: {
        required: true,
        type: String,
    },
    filename: {
        required: true,
        type: String,
    },
});

const Image = mongoose.model('Image', ImageSchema);

module.exports = Image;