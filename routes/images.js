const express = require('express')
const router = express.Router()
const Image = require('../models/image')

// Getting all
router.get('/', async (req, res) => {
    try{
        const images = await Image.find();
        res.json(images);
    } catch (err){
        res.status(500).json({ message: err.message });
    }
})
// Getting one
router.get('/:id', getImage, (req, res) => {
    res.contentType(res.img.contentType);
    res.send(res.img.data);
})
// creating one
router.post('/', async (req, res) => {
    // required fields
    console.log(req.body)
    const image = new Image({
        img: {
            data: req.body.image,
            contentType: 'image/' + req.body.fileEnding
        }
    })

    try {
        const newImage = await image.save();
        res.status(201).json(newImage)
    } catch (err) {
        res.status(400 /* wrong user input */).json({message: err.message})
    }
})

// deleting one
router.delete('/:id', getImage, async (req, res) => {
    try {
        await res.image.remove()
        res.json({ message: "Bild gelöscht"})
    } catch (err) {
        res.status(500).json({ message: err.message})
    }
})

async function getImage(req, res, next) {
    try {
        var image = await Image.findById(req.params.id)
        if (image == null){
            return res.status(404).json({message: 'Bild konnte nicht gefunden werden.'})
        }
    } catch (err) {
        return res.status(500).json( { message: err.message})
    }
    res.image = image
    next()
}

module.exports = router;